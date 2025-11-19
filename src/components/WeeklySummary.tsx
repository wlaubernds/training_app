import { TrendingUp, Dumbbell, Calendar, Target, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import type { Workout, WorkoutSession } from '../types';

interface WeeklySummaryProps {
  week: string;
  workouts: Workout[];
  sessions: WorkoutSession[];
}

export function WeeklySummary({ week, workouts, sessions }: WeeklySummaryProps) {
  // Calculate stats for this week
  const calculateWeekStats = () => {
    // Total exercises across all workouts in this week
    const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
    
    // Total sets across all exercises
    const totalSets = workouts.reduce((sum, w) => {
      return sum + w.exercises.reduce((exerciseSum, e) => exerciseSum + e.sets, 0);
    }, 0);

    // Get unique dates when workouts were done for this week
    const workoutIds = workouts.map(w => w.id);
    const weekSessions = sessions.filter(s => workoutIds.includes(s.workoutId));
    const uniqueDates = new Set(weekSessions.map(s => s.date));
    const daysActive = uniqueDates.size;

    // Count completed exercises
    let completedExercises = 0;
    let completedSets = 0;
    let fullyCompletedWorkouts = 0;

    workouts.forEach(workout => {
      // Get most recent session for this workout
      const workoutSessions = sessions
        .filter(s => s.workoutId === workout.id)
        .sort((a, b) => b.date.localeCompare(a.date));

      if (workoutSessions.length === 0) return;

      const latestSession = workoutSessions[0];
      let workoutCompleted = true;

      workout.exercises.forEach(exercise => {
        const exerciseSession = latestSession.sessionData.find(
          s => s.exerciseId === exercise.id
        );

        if (!exerciseSession) {
          workoutCompleted = false;
          return;
        }

        // Check if all sets are completed
        const allSetsComplete = exerciseSession.sets.every(
          set => set.weight !== undefined || set.reps !== undefined
        );

        if (allSetsComplete && exerciseSession.sets.length > 0) {
          completedExercises++;
          // Count completed sets
          completedSets += exerciseSession.sets.filter(
            set => set.weight !== undefined || set.reps !== undefined
          ).length;
        } else {
          workoutCompleted = false;
          // Still count partial sets
          completedSets += exerciseSession.sets.filter(
            set => set.weight !== undefined || set.reps !== undefined
          ).length;
        }
      });

      if (workoutCompleted && workout.exercises.length > 0) {
        fullyCompletedWorkouts++;
      }
    });

    const overallProgress = totalExercises > 0 
      ? Math.round((completedExercises / totalExercises) * 100) 
      : 0;

    // Total possible days is the number of workouts in the week
    const totalPossibleDays = workouts.length;

    return {
      completedExercises,
      totalExercises,
      fullyCompletedWorkouts,
      totalWorkouts: workouts.length,
      completedSets,
      totalSets,
      daysActive,
      totalPossibleDays,
      overallProgress
    };
  };

  const stats = calculateWeekStats();

  // Determine progress color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="size-5 text-primary" />
        <h3 className="text-white">{week} Summary</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Overall Progress</span>
          <span className="text-lg font-bold text-white">{stats.overallProgress}%</span>
        </div>
        <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full ${getProgressColor(stats.overallProgress)} transition-all duration-300`}
            style={{ width: `${stats.overallProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="size-4 text-slate-400" />
            <span className="text-xs text-slate-400">Exercises</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.completedExercises}/{stats.totalExercises}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="size-4 text-slate-400" />
            <span className="text-xs text-slate-400">Workouts</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.fullyCompletedWorkouts}/{stats.totalWorkouts}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="size-4 text-slate-400" />
            <span className="text-xs text-slate-400">Total Sets</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.completedSets}/{stats.totalSets}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-4 text-slate-400" />
            <span className="text-xs text-slate-400">Days Active</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.daysActive}/{stats.totalPossibleDays}
          </p>
        </div>
      </div>
    </Card>
  );
}

