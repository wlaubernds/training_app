import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import type { Workout, WorkoutSession, ExerciseSession } from '../types';

interface WorkoutTrackerProps {
  workout: Workout;
  sessions: WorkoutSession[];
  onBack: () => void;
  onSaveSession: (date: string, sessionData: ExerciseSession[]) => void;
}

export function WorkoutTracker({ workout, sessions, onBack, onSaveSession }: WorkoutTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionData, setSessionData] = useState<ExerciseSession[]>([]);

  useEffect(() => {
    const existingSession = sessions.find(s => s.date === selectedDate);
    
    if (existingSession) {
      setSessionData(existingSession.sessionData);
    } else {
      const emptyData: ExerciseSession[] = workout.exercises.map(exercise => ({
        exerciseId: exercise.id,
        sets: Array.from({ length: exercise.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: undefined,
          reps: undefined,
          completed: false
        })),
        notes: ''
      }));
      setSessionData(emptyData);
    }
  }, [selectedDate, workout.exercises, sessions]);

  const updateSet = (exerciseId: string, setNumber: number, field: 'weight' | 'reps' | 'completed', value: any) => {
    setSessionData(prev => {
      const updated = [...prev];
      const exerciseIndex = updated.findIndex(e => e.exerciseId === exerciseId);
      
      if (exerciseIndex === -1) return prev;
      
      const setIndex = updated[exerciseIndex].sets.findIndex(s => s.setNumber === setNumber);
      if (setIndex === -1) return prev;
      
      updated[exerciseIndex].sets[setIndex] = {
        ...updated[exerciseIndex].sets[setIndex],
        [field]: value
      };
      
      return updated;
    });
  };

  const updateNotes = (exerciseId: string, notes: string) => {
    setSessionData(prev => {
      const updated = [...prev];
      const exerciseIndex = updated.findIndex(e => e.exerciseId === exerciseId);
      
      if (exerciseIndex === -1) return prev;
      
      updated[exerciseIndex].notes = notes;
      return updated;
    });
  };

  const handleSave = () => {
    onSaveSession(selectedDate, sessionData);
  };

  const getPreviousSessionData = (exerciseId: string) => {
    const sortedSessions = [...sessions]
      .filter(s => s.date < selectedDate)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    if (sortedSessions.length === 0) return null;
    
    return sortedSessions[0].sessionData.find(s => s.exerciseId === exerciseId);
  };

  const groupedExercises = workout.exercises.reduce((acc, exercise) => {
    const category = exercise.category || 'Main';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, typeof workout.exercises>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSave}>
          <Save className="size-4 mr-2" />
          Save Session
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2>{workout.workoutName || workout.fileName}</h2>
            {workout.workoutDay && (
              <p className="text-muted-foreground">{workout.workoutDay}</p>
            )}
          </div>
          <div>
            <Label htmlFor="session-date">Session Date</Label>
            <Input
              id="session-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>

        {workout.equipment && workout.equipment.length > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="mb-2">Equipment Needed</h3>
            <div className="flex flex-wrap gap-2">
              {workout.equipment.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 bg-background rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(groupedExercises).map(([category, exercises]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className="px-3 py-1 bg-muted rounded">
                  {category}
                </div>
              </div>

              <div className="space-y-4">
                {exercises.map((exercise) => {
                  const exerciseSessionData = sessionData.find(s => s.exerciseId === exercise.id);
                  const previousData = getPreviousSessionData(exercise.id);

                  return (
                    <Card key={exercise.id} className="p-4">
                      <div className="mb-3">
                        <h4>{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.notes && ` • ${exercise.notes}`}
                        </p>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground px-2">
                          <div className="col-span-1">Set</div>
                          <div className="col-span-1"></div>
                          <div className="col-span-3">Weight (lbs)</div>
                          <div className="col-span-3">Reps</div>
                          {previousData && <div className="col-span-4">Previous</div>}
                        </div>

                        {exerciseSessionData?.sets.map((set) => {
                          const prevSet = previousData?.sets.find(s => s.setNumber === set.setNumber);
                          
                          return (
                            <div key={set.setNumber} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-1 text-center">{set.setNumber}</div>
                              <div className="col-span-1 flex justify-center">
                                <Checkbox
                                  checked={set.completed}
                                  onCheckedChange={(checked) => 
                                    updateSet(exercise.id, set.setNumber, 'completed', checked)
                                  }
                                />
                              </div>
                              <div className="col-span-3">
                                <Input
                                  type="number"
                                  placeholder="Weight"
                                  value={set.weight || ''}
                                  onChange={(e) => 
                                    updateSet(exercise.id, set.setNumber, 'weight', parseFloat(e.target.value) || undefined)
                                  }
                                />
                              </div>
                              <div className="col-span-3">
                                <Input
                                  type="number"
                                  placeholder="Reps"
                                  value={set.reps || ''}
                                  onChange={(e) => 
                                    updateSet(exercise.id, set.setNumber, 'reps', parseInt(e.target.value) || undefined)
                                  }
                                />
                              </div>
                              {previousData && (
                                <div className="col-span-4 text-sm text-muted-foreground">
                                  {prevSet?.weight || '-'} lbs × {prevSet?.reps || '-'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div>
                        <Label htmlFor={`notes-${exercise.id}`}>Notes</Label>
                        <Textarea
                          id={`notes-${exercise.id}`}
                          placeholder="Add notes about this exercise..."
                          value={exerciseSessionData?.notes || ''}
                          onChange={(e) => updateNotes(exercise.id, e.target.value)}
                          rows={2}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

