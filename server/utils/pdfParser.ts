import fs from 'fs';
import pdf from 'pdf-parse';
import type { Workout, Exercise } from '../../src/types';

export async function parsePDF(filePath: string): Promise<Workout[]> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    console.log('PDF Text Length:', text.length);

    // Parse the PDF into workouts
    const workouts = parseWorkoutsFromText(text, filePath);

    return workouts;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseWorkoutsFromText(text: string, filePath: string): Workout[] {
  const workouts: Workout[] = [];
  
  // Extract program, phase, and week metadata from lines like "GYM DAILY - IN SEASON WEEK 11"
  const metadataMatch = text.match(/([A-Z\s]+?)\s*-\s*([A-Z\s]+?)\s+WEEK\s+(\d+)/i);
  
  const program = metadataMatch ? metadataMatch[1].trim() : undefined;
  const phase = metadataMatch ? metadataMatch[2].trim() : undefined;
  const week = metadataMatch ? `Week ${metadataMatch[3]}` : undefined;

  // Split by workout days with format like "MONDAY (Hinge/Push)" or "TUESDAY ( Sprint Conditioning)"
  const dayPattern = /(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s*\(([^)]+)\)/gi;
  const dayMatches = Array.from(text.matchAll(dayPattern));

  console.log(`Found ${dayMatches.length} workout days`);

  if (dayMatches.length === 0) {
    // If no day markers found, create a single workout
    const workout = parseSingleWorkout(text, program, phase, week, filePath);
    if (workout.exercises.length > 0) {
      workouts.push(workout);
    }
  } else {
    // Parse each day as a separate workout
    for (let i = 0; i < dayMatches.length; i++) {
      const dayMatch = dayMatches[i];
      const dayName = dayMatch[1]; // e.g., "MONDAY"
      const workoutType = dayMatch[2].trim(); // e.g., "Hinge/Push"
      
      // Extract text for this workout (from this day to the next day)
      const startIndex = dayMatch.index!;
      const endIndex = i < dayMatches.length - 1 ? dayMatches[i + 1].index! : text.length;
      const workoutText = text.substring(startIndex, endIndex);

      const workout = parseSingleWorkout(workoutText, program, phase, week, filePath, `${dayName} - ${workoutType}`, dayName);
      if (workout.exercises.length > 0) {
        workouts.push(workout);
      }
    }
  }

  return workouts;
}

function parseSingleWorkout(
  text: string, 
  program?: string, 
  phase?: string, 
  week?: string,
  filePath?: string,
  workoutName?: string,
  workoutDay?: string
): Workout {
  const workoutId = `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const exercises: Exercise[] = [];

  // Extract equipment
  const equipmentMatch = text.match(/Equipment[:\s]+([^\n]+)/i);
  const equipment = equipmentMatch 
    ? equipmentMatch[1].split(/[,;]/).map(e => e.trim()).filter(Boolean)
    : [];

  // Parse exercises by category - looking for Warmup, BUY-IN, BLOCK 1, BLOCK 2, Cool Down, etc.
  const categories = [
    { name: 'Warmup', pattern: /Warmup[:\s]+([\s\S]*?)(?=(?:BUY-IN|BLOCK|Cool\s*Down|TOUR\s*DE\s*FRANCE|SCORE|$))/i },
    { name: 'Buy-in', pattern: /BUY-IN[:\s]+([\s\S]*?)(?=(?:BLOCK|Cool\s*Down|SCORE|$))/i },
    { name: 'Block 1', pattern: /BLOCK\s*1[:\s]+([\s\S]*?)(?=(?:BLOCK\s*2|REPEAT|Cool\s*Down|SCORE|$))/i },
    { name: 'Block 2', pattern: /BLOCK\s*2[:\s]+([\s\S]*?)(?=(?:BLOCK\s*3|REPEAT|Cool\s*Down|SCORE|$))/i },
    { name: 'Block 3', pattern: /BLOCK\s*3[:\s]+([\s\S]*?)(?=(?:BLOCK\s*4|REPEAT|Cool\s*Down|SCORE|$))/i },
    { name: 'Block 4', pattern: /BLOCK\s*4[:\s]+([\s\S]*?)(?=(?:BLOCK\s*5|REPEAT|Cool\s*Down|SCORE|$))/i },
    { name: 'Main', pattern: /(?:TOUR\s*DE\s*FRANCE|24\s*Min\s*AMRAP)[:\s]+([\s\S]*?)(?=(?:BLOCK|Cool\s*Down|SCORE|$))/i },
    { name: 'Cooldown', pattern: /Cool\s*Down[:\s]+([\s\S]*?)$/i },
  ];

  for (const category of categories) {
    const categoryMatch = text.match(category.pattern);
    if (categoryMatch) {
      const categoryText = categoryMatch[1];
      console.log(`Found ${category.name} section with ${categoryText.length} chars`);
      const categoryExercises = parseExercisesFromText(categoryText, category.name, workoutId);
      console.log(`  Extracted ${categoryExercises.length} exercises from ${category.name}`);
      exercises.push(...categoryExercises);
    }
  }

  console.log(`Total parsed ${exercises.length} exercises for ${workoutName}`);

  const workout: Workout = {
    id: workoutId,
    fileName: filePath || 'Workout',
    uploadDate: new Date().toISOString(),
    workoutName,
    workoutDay,
    program,
    phase,
    week,
    equipment,
    exercises
  };

  return workout;
}

function parseExercisesFromText(text: string, category: string, workoutId: string): Exercise[] {
  const exercises: Exercise[] = [];
  
  // Extract set/round info from headers like "E2MOMx 4 Rounds" or "x 2"
  let defaultSets = 1;
  const headerMatch = text.match(/^(?:x\s*(\d+)|E2MOM\s*x?\s*(\d+)|E90\s*"?\s*x?\s*(\d+))/i);
  if (headerMatch) {
    defaultSets = parseInt(headerMatch[1] || headerMatch[2] || headerMatch[3]);
  }
  
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (const line of lines) {
    // Match format: "Exercise Namex Reps" or "Exercise Name x Reps" (with or without space before x)
    // Examples: "Pigeon Push Upx 30 sec", "Clean + Hang Clean x 3", "Bikex 10/8 Cal"
    const match = line.match(/^(.+?)\s*x\s+(.+)$/i);
    
    if (!match) continue;
    
    let name = match[1].trim();
    const repsInfo = match[2].trim();
    
    // Skip if it's a header or metadata line
    if (name.match(/^(warmup|buy-in|block|score|equipment|round|min amrap|minute amrap|rest)/i)) {
      continue;
    }
    
    // Skip lines that are just descriptions of sets/rounds (like "E2MOM x 4 Rounds" or "x 2")
    if (name.match(/^(E2MOM|E90|x|Rounds?|Min|Minute|Alternate|REPEAT)$/i)) {
      continue;
    }
    
    // Skip "Rest" lines or other non-exercise lines
    if (repsInfo.match(/^(rest|sec rest)$/i)) {
      continue;
    }
    
    // Extract notes from parentheses
    let notes: string | undefined;
    const notesMatch = name.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (notesMatch) {
      name = notesMatch[1].trim();
      notes = notesMatch[2].trim();
    }
    
    // Parse sets and reps
    let sets = defaultSets;
    let reps = repsInfo;
    
    // Skip if name is too short
    if (name.length < 3) {
      continue;
    }
    
    const exercise: Exercise = {
      id: `ex_${workoutId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      sets,
      reps,
      category,
      notes,
      createdAt: new Date().toISOString()
    };
    
    exercises.push(exercise);
  }
  
  return exercises;
}
