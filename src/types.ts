// Exercise definition
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // Can be "10" or "10-12" or "AMRAP"
  category: string; // e.g., "Warmup", "Buy-in", "Main", "E2MOM", "Cooldown"
  notes?: string;
  createdAt: string;
}

// Workout definition
export interface Workout {
  id: string;
  fileName: string;
  uploadDate: string;
  exercises: Exercise[];
  workoutName?: string;
  workoutDay?: string; // e.g., "Monday - Hinge/Push"
  equipment?: string[]; // List of required equipment
  program?: string; // e.g., "Gym daily"
  phase?: string; // e.g., "In season"
  week?: string; // e.g., "Week 11"
}

// Set data for tracking
export interface SetData {
  setNumber: number;
  weight?: number;
  reps?: number;
  completed: boolean;
}

// Exercise session tracking
export interface ExerciseSession {
  exerciseId: string;
  sets: SetData[];
  notes?: string;
}

// Workout session (for a specific date)
export interface WorkoutSession {
  id: string;
  workoutId: string;
  date: string;
  sessionData: ExerciseSession[];
  createdAt: string;
}

