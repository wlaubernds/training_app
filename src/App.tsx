import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import type { Workout, WorkoutSession } from './types';
import { WorkoutList } from './pages/WorkoutList';
import { WorkoutBuilder } from './pages/WorkoutBuilder';
import { WorkoutTracker } from './pages/WorkoutTracker';

type View = 'list' | 'builder' | 'tracker';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    if (selectedWorkout) {
      loadSessions(selectedWorkout.id);
    }
  }, [selectedWorkout]);

  const loadWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      if (!response.ok) throw new Error('Failed to load workouts');
      
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async (workoutId: string) => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}/sessions`);
      if (!response.ok) throw new Error('Failed to load sessions');
      
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    }
  };

  const handleSelectWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setView('tracker');
  };

  const handleCreateWorkout = () => {
    setSelectedWorkout(null);
    setView('builder');
  };

  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setView('builder');
  };

  const handleSaveWorkout = async (workout: Workout) => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout)
      });

      if (!response.ok) throw new Error('Failed to save workout');

      toast.success('Workout saved successfully!');
      await loadWorkouts();
      setView('list');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const handleUploadPDF = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/workouts/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload PDF');
      }

      const data = await response.json();
      toast.success(data.message || 'PDF uploaded successfully!');
      await loadWorkouts();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload PDF');
      throw error;
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete workout');

      toast.success('Workout deleted');
      await loadWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const handleSaveSession = async (date: string, sessionData: any[]) => {
    if (!selectedWorkout) return;

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutId: selectedWorkout.id,
          date,
          sessionData
        })
      });

      if (!response.ok) throw new Error('Failed to save session');

      toast.success('Session saved!');
      await loadSessions(selectedWorkout.id);
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2">Workout Tracker</h1>
          <p className="text-muted-foreground">
            Track your weights, reps, and progress week over week
          </p>
        </div>

        {view === 'list' && (
          <WorkoutList
            workouts={workouts}
            onSelectWorkout={handleSelectWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onEditWorkout={handleEditWorkout}
            onCreateWorkout={handleCreateWorkout}
            onUploadPDF={handleUploadPDF}
          />
        )}

        {view === 'builder' && (
          <WorkoutBuilder
            workout={selectedWorkout}
            onSave={handleSaveWorkout}
            onBack={() => setView('list')}
          />
        )}

        {view === 'tracker' && selectedWorkout && (
          <WorkoutTracker
            workout={selectedWorkout}
            sessions={sessions}
            onBack={() => setView('list')}
            onSaveSession={handleSaveSession}
          />
        )}
      </div>
    </div>
  );
}
