import { useState, useEffect } from 'react';
import { Plus, Save, ArrowLeft, Edit, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { Workout, Exercise } from '../types';

interface WorkoutBuilderProps {
  workout: Workout | null;
  onSave: (workout: Workout) => void;
  onBack: () => void;
}

export function WorkoutBuilder({ workout, onSave, onBack }: WorkoutBuilderProps) {
  const [workoutName, setWorkoutName] = useState(workout?.workoutName || '');
  const [workoutDay, setWorkoutDay] = useState(workout?.workoutDay || '');
  const [program, setProgram] = useState(workout?.program || '');
  const [phase, setPhase] = useState(workout?.phase || '');
  const [week, setWeek] = useState(workout?.week || '');
  const [equipment, setEquipment] = useState<string[]>(workout?.equipment || []);
  const [newEquipmentItem, setNewEquipmentItem] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises || []);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: '10',
    category: 'Main',
    notes: ''
  });

  useEffect(() => {
    if (workout) {
      setWorkoutName(workout.workoutName || '');
      setWorkoutDay(workout.workoutDay || '');
      setProgram(workout.program || '');
      setPhase(workout.phase || '');
      setWeek(workout.week || '');
      setEquipment(workout.equipment || []);
      const exercisesWithIds = (workout.exercises || []).map((ex, index) => ({
        ...ex,
        id: ex.id || `ex_${workout.id}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      }));
      setExercises(exercisesWithIds);
    }
  }, [workout]);

  const handleAddExercise = () => {
    if (!newExercise.name) return;

    if (editingExerciseId) {
      setExercises(exercises.map(ex => 
        ex.id === editingExerciseId 
          ? { ...ex, ...newExercise }
          : ex
      ));
      setEditingExerciseId(null);
    } else {
      const exercise: Exercise = {
        id: `ex_${workout?.id || 'new'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...newExercise,
        createdAt: new Date().toISOString()
      };
      setExercises([...exercises, exercise]);
    }

    setNewExercise({
      name: '',
      sets: 3,
      reps: '10',
      category: 'Main',
      notes: ''
    });
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id);
    setNewExercise({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      category: exercise.category,
      notes: exercise.notes || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingExerciseId(null);
    setNewExercise({
      name: '',
      sets: 3,
      reps: '10',
      category: 'Main',
      notes: ''
    });
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    if (editingExerciseId === id) {
      handleCancelEdit();
    }
  };

  const handleAddEquipment = () => {
    if (newEquipmentItem.trim()) {
      setEquipment([...equipment, newEquipmentItem.trim()]);
      setNewEquipmentItem('');
    }
  };

  const handleRemoveEquipment = (item: string) => {
    setEquipment(equipment.filter(e => e !== item));
  };

  const handleSave = () => {
    const updatedWorkout: Workout = {
      id: workout?.id || `workout_${Date.now()}`,
      fileName: workout?.fileName || 'Manual Entry',
      uploadDate: workout?.uploadDate || new Date().toISOString(),
      workoutName,
      workoutDay,
      program,
      phase,
      week,
      equipment,
      exercises
    };

    onSave(updatedWorkout);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Workouts
        </Button>
        <Button onClick={handleSave}>
          <Save className="size-4 mr-2" />
          Save Workout
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="mb-4">Workout Details</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              placeholder="e.g., Upper Body Day 1"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="workout-day">Day/Type</Label>
            <Input
              id="workout-day"
              placeholder="e.g., Monday - Hinge/Push"
              value={workoutDay}
              onChange={(e) => setWorkoutDay(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              placeholder="Program name"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phase">Phase</Label>
            <Input
              id="phase"
              placeholder="Phase name"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="week">Week</Label>
            <Input
              id="week"
              placeholder="Week number"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="equipment">Equipment</Label>
            <div className="flex items-center gap-2">
              <Input
                id="equipment"
                placeholder="e.g., Barbell"
                value={newEquipmentItem}
                onChange={(e) => setNewEquipmentItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEquipment()}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddEquipment}
              >
                Add
              </Button>
            </div>
            {equipment.length > 0 && (
              <div className="mt-2 space-y-1">
                {equipment.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <span>{item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEquipment(item)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="mb-4">Exercises</h3>
          
          {exercises.length > 0 && (
            <div className="space-y-2 mb-4">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-background rounded text-xs">
                        {exercise.category}
                      </span>
                      <span>{exercise.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.notes && ` • ${exercise.notes}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExercise(exercise)}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(exercise.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <h4>{editingExerciseId ? 'Edit Exercise' : 'Add Exercise'}</h4>
              {editingExerciseId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  <X className="size-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
            
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ex-name">Exercise Name</Label>
                  <Input
                    id="ex-name"
                    placeholder="e.g., Barbell Squat"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ex-category">Category</Label>
                  <Select
                    value={newExercise.category}
                    onValueChange={(value) => setNewExercise({ ...newExercise, category: value })}
                  >
                    <SelectTrigger id="ex-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warmup">Warmup</SelectItem>
                      <SelectItem value="Buy-in">Buy-in</SelectItem>
                      <SelectItem value="Main">Main</SelectItem>
                      <SelectItem value="E2MOM">E2MOM</SelectItem>
                      <SelectItem value="E90">E90</SelectItem>
                      <SelectItem value="Cooldown">Cooldown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ex-sets">Sets</Label>
                  <Input
                    id="ex-sets"
                    type="number"
                    min="1"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="ex-reps">Reps</Label>
                  <Input
                    id="ex-reps"
                    placeholder="e.g., 10 or 10-12 or AMRAP"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ex-notes">Notes (Optional)</Label>
                <Textarea
                  id="ex-notes"
                  placeholder="Any additional notes about this exercise"
                  value={newExercise.notes}
                  onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <Button onClick={handleAddExercise} className="w-full">
                {editingExerciseId ? (
                  <>
                    <Save className="size-4 mr-2" />
                    Update Exercise
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    Add Exercise
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

