import { Calendar, Dumbbell, Trash2, Plus, Edit, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useState, useMemo } from 'react';
import type { Workout } from '../types';

interface WorkoutListProps {
  workouts: Workout[];
  onSelectWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onEditWorkout: (workout: Workout) => void;
  onCreateWorkout: () => void;
  onUploadPDF: (file: File) => Promise<void>;
}

export function WorkoutList({ workouts, onSelectWorkout, onDeleteWorkout, onEditWorkout, onCreateWorkout, onUploadPDF }: WorkoutListProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');

  // Get unique values for filters
  const programs = useMemo(() => {
    const unique = [...new Set(workouts.map(w => w.program).filter(Boolean))];
    return unique.sort();
  }, [workouts]);

  const phases = useMemo(() => {
    const unique = [...new Set(workouts.map(w => w.phase).filter(Boolean))];
    return unique.sort();
  }, [workouts]);

  const weeks = useMemo(() => {
    const unique = [...new Set(workouts.map(w => w.week).filter(Boolean))];
    return unique.sort((a, b) => {
      const aNum = parseInt(a?.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b?.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    });
  }, [workouts]);

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      if (selectedProgram !== 'all' && workout.program !== selectedProgram) return false;
      if (selectedPhase !== 'all' && workout.phase !== selectedPhase) return false;
      if (selectedWeek !== 'all' && workout.week !== selectedWeek) return false;
      return true;
    });
  }, [workouts, selectedProgram, selectedPhase, selectedWeek]);

  // Group workouts by week
  const workoutsByWeek = useMemo(() => {
    const grouped = filteredWorkouts.reduce((acc, workout) => {
      const week = workout.week || 'Uncategorized';
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(workout);
      return acc;
    }, {} as Record<string, Workout[]>);

    return Object.entries(grouped).sort(([a], [b]) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    });
  }, [filteredWorkouts]);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUploadPDF(file);
    } catch (error) {
      console.error('PDF upload error:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2>My Workouts</h2>
        <div className="flex gap-2">
          <label htmlFor="pdf-upload-list">
            <Button variant="outline" disabled={isUploading} asChild>
              <span>
                <Upload className="size-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload PDF'}
              </span>
            </Button>
          </label>
          <Input
            id="pdf-upload-list"
            type="file"
            accept=".pdf"
            onChange={handlePDFUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Button onClick={onCreateWorkout}>
            <Plus className="size-4 mr-2" />
            New Workout
          </Button>
        </div>
      </div>

      {isUploading && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <p className="text-sm">Parsing PDF and creating workouts...</p>
          </div>
        </Card>
      )}

      {/* Filters */}
      {workouts.length > 0 && (
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Program</label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map(program => (
                    <SelectItem key={program} value={program!}>{program}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Phase</label>
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                <SelectTrigger>
                  <SelectValue placeholder="All Phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  {phases.map(phase => (
                    <SelectItem key={phase} value={phase!}>{phase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Week</label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="All Weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {weeks.map(week => (
                    <SelectItem key={week} value={week!}>{week}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(selectedProgram !== 'all' || selectedPhase !== 'all' || selectedWeek !== 'all') && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredWorkouts.length} of {workouts.length} workouts
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedProgram('all');
                  setSelectedPhase('all');
                  setSelectedWeek('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {workouts.length === 0 ? (
        <Card className="p-8 text-center">
          <Dumbbell className="size-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No workouts yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first workout to start tracking your progress
          </p>
          <Button onClick={onCreateWorkout}>
            <Plus className="size-4 mr-2" />
            Create Workout
          </Button>
        </Card>
      ) : filteredWorkouts.length === 0 ? (
        <Card className="p-8 text-center">
          <Dumbbell className="size-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No workouts match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or clear them to see all workouts
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedProgram('all');
              setSelectedPhase('all');
              setSelectedWeek('all');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {workoutsByWeek.map(([week, weekWorkouts]) => (
            <div key={week}>
              <div className="mb-3">
                <h3>{week}</h3>
                {weekWorkouts[0]?.program && weekWorkouts[0]?.phase && (
                  <p className="text-sm text-muted-foreground">
                    {weekWorkouts[0].program} • {weekWorkouts[0].phase}
                  </p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weekWorkouts.map((workout) => (
                  <Card 
                    key={workout.id} 
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => onSelectWorkout(workout)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="mb-1">{workout.workoutName || workout.fileName}</h4>
                        {workout.workoutDay && (
                          <p className="text-muted-foreground text-sm">{workout.workoutDay}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditWorkout(workout);
                          }}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteWorkout(workout.id);
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Dumbbell className="size-4" />
                        <span>{workout.exercises.length} exercises</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <span>{new Date(workout.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

