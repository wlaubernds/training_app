import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Copy, History, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import type { Workout, WorkoutSession, ExerciseSession } from '../types';

interface WorkoutTrackerProps {
  workout: Workout;
  workouts: Workout[];
  sessions: WorkoutSession[];
  onBack: () => void;
  onSaveSession: (date: string, sessionData: ExerciseSession[]) => void;
}

export function WorkoutTracker({ workout, workouts, sessions, onBack, onSaveSession }: WorkoutTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionData, setSessionData] = useState<ExerciseSession[]>([]);

  useEffect(() => {
    const existingSession = sessions.find(s => s.workoutId === workout.id && s.date === selectedDate);
    
    if (existingSession) {
      setSessionData(existingSession.sessionData);
    } else {
      const emptyData: ExerciseSession[] = workout.exercises.map(exercise => ({
        exerciseId: exercise.id,
        sets: Array.from({ length: exercise.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: undefined,
          reps: undefined,
          completed: false // Auto-set based on data entry
        })),
        notes: ''
      }));
      setSessionData(emptyData);
    }
  }, [selectedDate, workout.exercises, workout.id, sessions]);

  const updateSet = (exerciseId: string, setNumber: number, field: 'weight' | 'reps', value: any) => {
    setSessionData(prev => {
      const updated = [...prev];
      const exerciseIndex = updated.findIndex(e => e.exerciseId === exerciseId);
      
      if (exerciseIndex === -1) return prev;
      
      const setIndex = updated[exerciseIndex].sets.findIndex(s => s.setNumber === setNumber);
      if (setIndex === -1) return prev;
      
      const currentSet = updated[exerciseIndex].sets[setIndex];
      const updatedSet = {
        ...currentSet,
        [field]: value
      };
      
      // Auto-mark as completed if weight OR reps are entered (including 0)
      updatedSet.completed = updatedSet.weight !== undefined || updatedSet.reps !== undefined;
      
      updated[exerciseIndex].sets[setIndex] = updatedSet;
      
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

  const copySetDown = (exerciseId: string, setNumber: number) => {
    setSessionData(prev => {
      const updated = [...prev];
      const exerciseIndex = updated.findIndex(e => e.exerciseId === exerciseId);
      
      if (exerciseIndex === -1) return prev;
      
      const sourceSet = updated[exerciseIndex].sets.find(s => s.setNumber === setNumber);
      if (!sourceSet) return prev;
      
      // Copy weight and reps to all sets below this one
      updated[exerciseIndex].sets = updated[exerciseIndex].sets.map(set => {
        if (set.setNumber > setNumber) {
          return {
            ...set,
            weight: sourceSet.weight,
            reps: sourceSet.reps,
            completed: sourceSet.weight !== undefined || sourceSet.reps !== undefined
          };
        }
        return set;
      });
      
      return updated;
    });
  };

  const handleSave = () => {
    onSaveSession(selectedDate, sessionData);
  };

  const normalizeExerciseName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // normalize whitespace
      .replace(/[()]/g, '') // remove parentheses
      .replace(/\b(db|dumbbell|barbell|bb)\b/gi, '') // remove equipment prefixes
      .trim();
  };

  const getPreviousSessionData = (exerciseName: string) => {
    const normalizedSearchName = normalizeExerciseName(exerciseName);
    
    // First, try to find the previous week's workout
    const currentWeekMatch = workout.week?.match(/\d+/);
    
    if (currentWeekMatch) {
      const currentWeekNumber = parseInt(currentWeekMatch[0]);
      const previousWeekNumber = currentWeekNumber - 1;
      const previousWeekString = `Week ${previousWeekNumber}`;
      
      // Find the workout from the previous week with same program, phase, and day
      const previousWeekWorkout = workouts.find(w => 
        w.week === previousWeekString &&
        w.program === workout.program &&
        w.phase === workout.phase &&
        w.workoutDay === workout.workoutDay
      );
      
      if (previousWeekWorkout) {
        // Find the exercise in the previous week's workout by normalized name
        const previousExercise = previousWeekWorkout.exercises.find(e => 
          normalizeExerciseName(e.name) === normalizedSearchName
        );
        
        if (previousExercise) {
          // Get the most recent session for the previous week's workout
          const previousWeekSessions = [...sessions]
            .filter(s => s.workoutId === previousWeekWorkout.id)
            .sort((a, b) => b.date.localeCompare(a.date));
          
          if (previousWeekSessions.length > 0) {
            const sessionData = previousWeekSessions[0].sessionData.find(s => s.exerciseId === previousExercise.id);
            if (sessionData && sessionData.sets.some(set => set.weight !== undefined || set.reps !== undefined)) {
              console.log(`✅ Found previous week data for ${exerciseName}:`, sessionData);
              return sessionData;
            }
          }
        }
      }
    }
    
    // Extended fallback: Search ALL workouts for the most recent session with this exercise name
    // Build a list of all exercises with matching normalized names from all workouts
    const matchingExercises = workouts.flatMap(w => 
      w.exercises
        .filter(e => normalizeExerciseName(e.name) === normalizedSearchName)
        .map(e => ({ exerciseId: e.id, workoutId: w.id, workout: w }))
    );
    
    // Get all sessions that have data for any of these exercises, sorted by date
    const allMatchingSessions = sessions
      .filter(s => s.date < selectedDate)
      .flatMap(session => 
        session.sessionData
          .filter(sd => matchingExercises.some(me => me.exerciseId === sd.exerciseId && me.workoutId === session.workoutId))
          .filter(sd => sd.sets.some(set => set.weight !== undefined || set.reps !== undefined))
          .map(sd => ({ ...sd, sessionDate: session.date }))
      )
      .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
    
    if (allMatchingSessions.length > 0) {
      console.log(`✅ Found historical data for ${exerciseName}:`, allMatchingSessions[0]);
      return allMatchingSessions[0];
    }
    
    console.log(`❌ No previous data found for ${exerciseName}`);
    return null;
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
          <div className="flex-1">
            {workout.isChallenge && (
              <div className="flex items-center gap-2 mb-2">
                <Award className="size-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Challenge Week
                </span>
              </div>
            )}
            {workout.workoutTitle ? (
              <>
                <h1 className="text-2xl font-bold mb-2">{workout.workoutTitle}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {workout.workoutDay && <span className="font-medium">{workout.workoutDay}</span>}
                  {workout.week && <span>{workout.week}</span>}
                </div>
              </>
            ) : (
              <h2>
                {workout.workoutName || workout.fileName}
                {workout.week && (
                  <span className="ml-3 text-muted-foreground font-normal">{workout.week}</span>
                )}
              </h2>
            )}
            {(workout.timeCap || workout.scoringType) && (
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {workout.timeCap && (
                  <span className="flex items-center gap-1">
                    ⏱️ Time Cap: {workout.timeCap}
                  </span>
                )}
                {workout.scoringType && (
                  <span className="flex items-center gap-1">
                    📊 Score: {workout.scoringType}
                  </span>
                )}
              </div>
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
                  const previousData = getPreviousSessionData(exercise.name);

                  return (
                    <Card key={exercise.id} className="p-4">
                      <div className="mb-3">
                        <h4>{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.notes && ` • ${exercise.notes}`}
                        </p>
                      </div>

                      {/* Previous Week Info Box */}
                      {previousData && previousData.sets && previousData.sets.length > 0 && (
                        <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-500 dark:border-blue-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                            <History className="size-4" />
                            <span className="font-semibold text-sm">Last Week</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">Set</div>
                            <div className="font-semibold text-blue-600 dark:text-blue-400">Weight</div>
                            <div className="font-semibold text-blue-600 dark:text-blue-400">Reps</div>
                            {previousData.sets.map((prevSet) => (
                              <div key={prevSet.setNumber} className="contents">
                                <div className="text-blue-600 dark:text-blue-400">{prevSet.setNumber}</div>
                                <div className="text-blue-600 dark:text-blue-400">
                                  {prevSet.weight !== undefined && prevSet.weight !== null ? `${prevSet.weight} lbs` : '- lbs'}
                                </div>
                                <div className="text-blue-600 dark:text-blue-400">
                                  {prevSet.reps !== undefined && prevSet.reps !== null ? prevSet.reps : '-'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 mb-3">
                        <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground px-2">
                          <div className="col-span-1">Set</div>
                          <div className="col-span-3">Weight (lbs)</div>
                          <div className="col-span-3">Reps</div>
                          <div className="col-span-5"></div>
                        </div>

                        {exerciseSessionData?.sets.map((set, index) => {
                          const isLastSet = index === exerciseSessionData.sets.length - 1;
                          const hasData = set.weight !== undefined || set.reps !== undefined;
                          
                          return (
                            <div key={set.setNumber} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-1 text-center font-medium">{set.setNumber}</div>
                              <div className="col-span-3">
                                <Input
                                  type="number"
                                  placeholder="Weight"
                                  value={set.weight ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                    updateSet(exercise.id, set.setNumber, 'weight', value);
                                  }}
                                  className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                />
                              </div>
                              <div className="col-span-3">
                                <Input
                                  type="number"
                                  placeholder="Reps"
                                  value={set.reps ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                    updateSet(exercise.id, set.setNumber, 'reps', value);
                                  }}
                                  className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                />
                              </div>
                              <div className="col-span-5 flex justify-start pl-2">
                                {!isLastSet && hasData && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => copySetDown(exercise.id, set.setNumber)}
                                    title="Copy to sets below"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
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

