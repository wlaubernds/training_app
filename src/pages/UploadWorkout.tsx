import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Plus, Minus } from 'lucide-react';

export default function UploadWorkout() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  
  // Manual entry state
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([
    { name: '', sets: 3, reps: '10' }
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:3001/api/workouts/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      navigate(`/workout/${data.workoutId}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workoutName,
          date: workoutDate,
          exercises: exercises.filter(ex => ex.name.trim()),
        }),
      });

      if (!response.ok) throw new Error('Failed to create workout');

      const data = await response.json();
      navigate(`/workout/${data.workoutId}`);
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to create workout. Please try again.');
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: '10' }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Workout</h1>

      <div className="card mb-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upload PDF
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual Entry
          </button>
        </div>

        {mode === 'upload' ? (
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer">
                {uploading ? (
                  <div className="text-gray-600">Uploading...</div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">PDF files only</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            </label>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">PDF Format Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Exercise format: "Exercise Name - 3 x 8 @ 3010 - 90s"</li>
                    <li>Or simpler: "Exercise Name 3x8"</li>
                    <li>The app will do its best to parse your workout format</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Name
                </label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="input w-full"
                  placeholder="e.g., Upper Body Day 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Exercises
                  </label>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Exercise
                  </button>
                </div>

                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        className="input flex-1"
                        placeholder="Exercise name"
                      />
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                        className="input w-20"
                        placeholder="Sets"
                        min="1"
                      />
                      <input
                        type="text"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                        className="input w-24"
                        placeholder="Reps"
                      />
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Create Workout
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

