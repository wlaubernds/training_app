import { createClient } from '@supabase/supabase-js';
import type { Workout, Exercise, WorkoutSession } from '../../src/types';

// Initialize Supabase client for server-side use
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️  Missing Supabase environment variables!');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===== Workout Functions =====

export async function insertWorkout(workout: Omit<Workout, 'exercises'>, userId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      id: workout.id,
      user_id: userId,
      file_name: workout.fileName,
      upload_date: workout.uploadDate,
      workout_name: workout.workoutName,
      workout_day: workout.workoutDay,
      program: workout.program,
      phase: workout.phase,
      week: workout.week,
      equipment: workout.equipment ? JSON.stringify(workout.equipment) : null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting workout:', error);
    throw error;
  }

  return data;
}

export async function getWorkouts(userId: string): Promise<Workout[]> {
  const { data: workoutsData, error: workoutsError } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (workoutsError) {
    console.error('Error fetching workouts:', workoutsError);
    throw workoutsError;
  }

  // Fetch exercises for each workout
  const workouts: Workout[] = [];
  for (const workout of workoutsData) {
    const exercises = await getExercisesByWorkoutId(workout.id, userId);
    workouts.push({
      id: workout.id,
      fileName: workout.file_name,
      uploadDate: workout.upload_date,
      workoutName: workout.workout_name,
      workoutDay: workout.workout_day,
      program: workout.program,
      phase: workout.phase,
      week: workout.week,
      equipment: workout.equipment ? JSON.parse(workout.equipment) : [],
      exercises,
    });
  }

  return workouts;
}

export async function getWorkoutById(workoutId: string, userId: string): Promise<Workout | null> {
  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .eq('user_id', userId)
    .single();

  if (workoutError) {
    console.error('Error fetching workout:', workoutError);
    return null;
  }

  const exercises = await getExercisesByWorkoutId(workoutId, userId);

  return {
    id: workoutData.id,
    fileName: workoutData.file_name,
    uploadDate: workoutData.upload_date,
    workoutName: workoutData.workout_name,
    workoutDay: workoutData.workout_day,
    program: workoutData.program,
    phase: workoutData.phase,
    week: workoutData.week,
    equipment: workoutData.equipment ? JSON.parse(workoutData.equipment) : [],
    exercises,
  };
}

export async function deleteWorkout(workoutId: string, userId: string) {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
}

// ===== Exercise Functions =====

export async function insertExercise(exercise: Exercise, workoutId: string, userId: string) {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      id: exercise.id,
      workout_id: workoutId,
      user_id: userId,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      category: exercise.category,
      notes: exercise.notes,
      created_at: exercise.createdAt,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting exercise:', error);
    throw error;
  }

  return data;
}

export async function getExercisesByWorkoutId(workoutId: string, userId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    name: row.name,
    sets: row.sets,
    reps: row.reps,
    category: row.category,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

// ===== Workout Session Functions =====

export async function insertWorkoutSession(session: WorkoutSession, userId: string) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      id: session.id,
      workout_id: session.workoutId,
      user_id: userId,
      date: session.date,
      session_data: JSON.stringify(session.sessionData),
      created_at: session.createdAt,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting workout session:', error);
    throw error;
  }

  return data;
}

export async function getWorkoutSessionsByWorkoutId(workoutId: string, userId: string): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('workout_id', workoutId)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching workout sessions:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    workoutId: row.workout_id,
    date: row.date,
    sessionData: JSON.parse(row.session_data),
    createdAt: row.created_at,
  }));
}

export async function getLatestWorkoutSessionForExercise(
  exerciseId: string, 
  workoutId: string, 
  userId: string
): Promise<WorkoutSession | null> {
  const sessions = await getWorkoutSessionsByWorkoutId(workoutId, userId);
  
  // Find the most recent session that has data for this exercise
  for (const session of sessions) {
    const exerciseData = session.sessionData.find(e => e.exerciseId === exerciseId);
    if (exerciseData) {
      return session;
    }
  }
  
  return null;
}

