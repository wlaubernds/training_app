import Database from 'better-sqlite3';
import path from 'path';
import type { Workout, Exercise, WorkoutSession, ExerciseSession, SetData } from '../../src/types';

const db = new Database(path.join(process.cwd(), 'workouts.db'));

// === Workout Functions ===

export function insertWorkout(workout: Workout): void {
  const stmt = db.prepare(`
    INSERT INTO workouts (id, file_name, upload_date, workout_name, workout_day, program, phase, week, equipment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    workout.id,
    workout.fileName,
    workout.uploadDate,
    workout.workoutName || null,
    workout.workoutDay || null,
    workout.program || null,
    workout.phase || null,
    workout.week || null,
    JSON.stringify(workout.equipment || [])
  );

  // Insert exercises
  for (const exercise of workout.exercises) {
    insertExercise(exercise, workout.id);
  }
}

export function getWorkouts(): Workout[] {
  const stmt = db.prepare(`
    SELECT * FROM workouts ORDER BY created_at DESC
  `);

  const workouts = stmt.all() as any[];

  return workouts.map(workout => {
    const exercises = getExercisesByWorkoutId(workout.id);

    return {
      id: workout.id,
      fileName: workout.file_name,
      uploadDate: workout.upload_date,
      workoutName: workout.workout_name,
      workoutDay: workout.workout_day,
      program: workout.program,
      phase: workout.phase,
      week: workout.week,
      equipment: JSON.parse(workout.equipment || '[]'),
      exercises
    };
  });
}

export function getWorkoutById(id: string): Workout | null {
  const stmt = db.prepare(`SELECT * FROM workouts WHERE id = ?`);
  const workout = stmt.get(id) as any;

  if (!workout) return null;

  const exercises = getExercisesByWorkoutId(workout.id);

  return {
    id: workout.id,
    fileName: workout.file_name,
    uploadDate: workout.upload_date,
    workoutName: workout.workout_name,
    workoutDay: workout.workout_day,
    program: workout.program,
    phase: workout.phase,
    week: workout.week,
    equipment: JSON.parse(workout.equipment || '[]'),
    exercises
  };
}

export function deleteWorkout(id: string): void {
  const stmt = db.prepare(`DELETE FROM workouts WHERE id = ?`);
  stmt.run(id);
}

// === Exercise Functions ===

export function insertExercise(exercise: Exercise, workoutId: string): void {
  const stmt = db.prepare(`
    INSERT INTO exercises (id, workout_id, name, sets, reps, category, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    exercise.id,
    workoutId,
    exercise.name,
    exercise.sets,
    exercise.reps,
    exercise.category,
    exercise.notes || null,
    exercise.createdAt
  );
}

export function getExercisesByWorkoutId(workoutId: string): Exercise[] {
  const stmt = db.prepare(`
    SELECT * FROM exercises WHERE workout_id = ? ORDER BY created_at
  `);

  const exercises = stmt.all(workoutId) as any[];

  return exercises.map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    category: exercise.category,
    notes: exercise.notes,
    createdAt: exercise.created_at
  }));
}

// === Session Functions ===

export function insertWorkoutSession(session: WorkoutSession): void {
  const stmt = db.prepare(`
    INSERT INTO workout_sessions (id, workout_id, date, created_at)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(session.id, session.workoutId, session.date, session.createdAt);

  // Insert exercise sessions and set data
  for (const exerciseSession of session.sessionData) {
    const exerciseSessionId = `es_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const exStmt = db.prepare(`
      INSERT INTO exercise_sessions (id, session_id, exercise_id, notes, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    exStmt.run(
      exerciseSessionId,
      session.id,
      exerciseSession.exerciseId,
      exerciseSession.notes || null,
      new Date().toISOString()
    );

    // Insert set data
    for (const setData of exerciseSession.sets) {
      const setStmt = db.prepare(`
        INSERT INTO set_data (exercise_session_id, set_number, weight, reps, completed)
        VALUES (?, ?, ?, ?, ?)
      `);

      setStmt.run(
        exerciseSessionId,
        setData.setNumber,
        setData.weight || null,
        setData.reps || null,
        setData.completed ? 1 : 0
      );
    }
  }
}

export function getWorkoutSessions(workoutId: string): WorkoutSession[] {
  const stmt = db.prepare(`
    SELECT * FROM workout_sessions WHERE workout_id = ? ORDER BY date DESC
  `);

  const sessions = stmt.all(workoutId) as any[];

  return sessions.map(session => {
    const sessionData = getExerciseSessions(session.id);

    return {
      id: session.id,
      workoutId: session.workout_id,
      date: session.date,
      sessionData,
      createdAt: session.created_at
    };
  });
}

function getExerciseSessions(sessionId: string): ExerciseSession[] {
  const stmt = db.prepare(`
    SELECT * FROM exercise_sessions WHERE session_id = ?
  `);

  const exerciseSessions = stmt.all(sessionId) as any[];

  return exerciseSessions.map(exSession => {
    const setStmt = db.prepare(`
      SELECT * FROM set_data WHERE exercise_session_id = ? ORDER BY set_number
    `);

    const sets = setStmt.all(exSession.id) as any[];

    return {
      exerciseId: exSession.exercise_id,
      sets: sets.map(set => ({
        setNumber: set.set_number,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed === 1
      })),
      notes: exSession.notes
    };
  });
}

export default db;
