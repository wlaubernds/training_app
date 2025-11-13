import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Workout {
  id: number;
  name: string;
  date: string;
  pdf_filename?: string;
  created_at: string;
}

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/workouts');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading workouts...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Workouts</h1>
        <Link to="/upload" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Workout
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No workouts yet
          </h3>
          <p className="text-gray-600 mb-4">
            Upload a PDF or create your first workout to get started
          </p>
          <Link to="/upload" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Workout
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              to={`/workout/${workout.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  {workout.name}
                </h3>
                {workout.pdf_filename && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                    PDF
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {format(new Date(workout.date), 'MMM d, yyyy')}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

