import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Save, History } from 'lucide-react';
import { format } from 'date-fns';

interface ExerciseLog {
  id?: number;
  exercise_id: number;
  set_number: number;
  weight?: number;
  reps_completed?: number;
  notes?: string;
}

interface Exercise {
  id: number;
  name: string;
  sets?: number;
  reps?: string;
  tempo?: string;
  rest?: string;
  logs: ExerciseLog[];
}

interface Workout {
  id: number;
  name: string;
  date: string;
  exercises: Exercise[];
}

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/workouts/${id}`);
      const data = await response.json();
      setWorkout(data);
      
      // Initialize exercise logs
      const logs: Record<string, ExerciseLog[]> = {};
      data.exercises.forEach((exercise: Exercise) => {
        const sets = exercise.sets || 3;
        logs[exercise.id] = Array.from({ length: sets }, (_, i) => {
          // Check if there's an existing log for this set
          const existingLog = exercise.logs.find(log => log.set_number === i + 1);
          return existingLog || {
            exercise_id: exercise.id,
            set_number: i + 1,
            weight: undefined,
            reps_completed: undefined,
            notes: '',
          };
        });
      });
      setExerciseLogs(logs);
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLog = (exerciseId: number, setNumber: number, field: string, value: any) => {
    setExerciseLogs(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(log =>
        log.set_number === setNumber
          ? { ...log, [field]: value }
          : log
      ),
    }));
  };

  const saveLog = async (exerciseId: number, setNumber: number) => {
    const log = exerciseLogs[exerciseId]?.find(l => l.set_number === setNumber);
    if (!log) return;

    setSaving(true);
    try {
      if (log.id) {
        // Update existing log
        await fetch(`http://localhost:3001/api/exercise-logs/${log.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weight: log.weight,
            reps_completed: log.reps_completed,
            notes: log.notes,
          }),
        });
      } else {
        // Create new log
        const response = await fetch('http://localhost:3001/api/exercise-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log),
        });
        const data = await response.json();
        
        // Update the log with the new ID
        setExerciseLogs(prev => ({
          ...prev,
          [exerciseId]: prev[exerciseId].map(l =>
            l.set_number === setNumber ? { ...l, id: data.id } : l
          ),
        }));
      }
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading workout...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Workout not found</h2>
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          Back to workouts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to workouts
      </Link>

      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{workout.name}</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      <div className="space-y-6">
        {workout.exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                <div className="flex gap-4 mt-1 text-sm text-gray-600">
                  {exercise.sets && <span>{exercise.sets} sets</span>}
                  {exercise.reps && <span>{exercise.reps} reps</span>}
                  {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                  {exercise.rest && <span>Rest: {exercise.rest}</span>}
                </div>
              </div>
              <button
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                title="View exercise history"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                <div className="col-span-1">Set</div>
                <div className="col-span-3">Weight (lbs)</div>
                <div className="col-span-2">Reps</div>
                <div className="col-span-5">Notes</div>
                <div className="col-span-1"></div>
              </div>

              {exerciseLogs[exercise.id]?.map((log) => (
                <div key={log.set_number} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-sm font-medium text-gray-700">
                    {log.set_number}
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="2.5"
                      value={log.weight || ''}
                      onChange={(e) => updateLog(exercise.id, log.set_number, 'weight', parseFloat(e.target.value) || undefined)}
                      className="input w-full"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={log.reps_completed || ''}
                      onChange={(e) => updateLog(exercise.id, log.set_number, 'reps_completed', parseInt(e.target.value) || undefined)}
                      className="input w-full"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={log.notes || ''}
                      onChange={(e) => updateLog(exercise.id, log.set_number, 'notes', e.target.value)}
                      className="input w-full"
                      placeholder="How did it feel?"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => saveLog(exercise.id, log.set_number)}
                      disabled={saving}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                      title="Save set"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {workout.exercises.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600">No exercises found in this workout</p>
        </div>
      )}
    </div>
  );
}

