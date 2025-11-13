import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'workouts.db'));

// Create tables with new schema
db.exec(`
  -- Drop old tables if they exist
  DROP TABLE IF EXISTS exercise_logs;
  DROP TABLE IF EXISTS exercises;
  DROP TABLE IF EXISTS workouts;

  -- Workouts table with new structure
  CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    workout_name TEXT,
    workout_day TEXT,
    program TEXT,
    phase TEXT,
    week TEXT,
    equipment TEXT, -- JSON array of equipment
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Exercises table
  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Main',
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  );

  -- Workout sessions table
  CREATE TABLE IF NOT EXISTS workout_sessions (
    id TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  );

  -- Exercise sessions (set tracking)
  CREATE TABLE IF NOT EXISTS exercise_sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  );

  -- Set data
  CREATE TABLE IF NOT EXISTS set_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_session_id TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL,
    reps INTEGER,
    completed INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true
    FOREIGN KEY (exercise_session_id) REFERENCES exercise_sessions(id) ON DELETE CASCADE
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
  CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions(workout_id);
  CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);
  CREATE INDEX IF NOT EXISTS idx_exercise_sessions_session_id ON exercise_sessions(session_id);
  CREATE INDEX IF NOT EXISTS idx_set_data_exercise_session_id ON set_data(exercise_session_id);
`);

console.log('✅ Database schema created successfully!');
db.close();
