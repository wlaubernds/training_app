-- Supabase Database Schema for Workout Tracker App
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable Row Level Security (RLS) on all tables
-- This ensures users can only see their own data

-- =============================================
-- TABLES
-- =============================================

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  upload_date TEXT NOT NULL,
  workout_name TEXT,
  workout_day TEXT,
  program TEXT,
  phase TEXT,
  week TEXT,
  equipment TEXT, -- JSON array of equipment
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workout sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  session_data TEXT NOT NULL, -- JSON data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES for better query performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_program_phase_week ON workouts(program, phase, week);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "Users can view their own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Exercises policies
CREATE POLICY "Users can view their own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);

-- Workout sessions policies
CREATE POLICY "Users can view their own workout sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKET for PDF uploads
-- =============================================

-- Create a storage bucket for workout PDFs (run in Supabase Storage, not SQL Editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('workout-pdfs', 'workout-pdfs', false);

-- Storage policies (allow authenticated users to upload/download their own files)
-- These need to be created in the Supabase Dashboard under Storage > Policies

