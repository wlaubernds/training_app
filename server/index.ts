import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import type { Workout, WorkoutSession } from '../src/types';
import { 
  insertWorkout, 
  getWorkouts, 
  getWorkoutById, 
  deleteWorkout,
  insertWorkoutSession,
  getWorkoutSessions 
} from './db/database.js';
import { parsePDF } from './utils/pdfParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Setup multer for file uploads
const uploadDir = join(__dirname, '../uploads');

// Ensure uploads directory exists
try {
  mkdirSync(uploadDir, { recursive: true });
} catch (error) {
  console.error('Failed to create uploads directory:', error);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// === API Routes ===

// Get all workouts
app.get('/api/workouts', (_req, res) => {
  try {
    const workouts = getWorkouts();
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// Get workout by ID
app.get('/api/workouts/:id', (req, res) => {
  try {
    const workout = getWorkoutById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

// Create or update workout
app.post('/api/workouts', (req, res) => {
  try {
    const workout = req.body as Workout;
    
    // Validate workout
    if (!workout.id || !workout.fileName || !workout.uploadDate) {
      return res.status(400).json({ error: 'Invalid workout data' });
    }
    
    // Delete existing workout if updating
    try {
      deleteWorkout(workout.id);
    } catch {
      // Workout doesn't exist yet, that's fine
    }
    
    // Insert new workout
    insertWorkout(workout);
    
    res.json({ message: 'Workout saved successfully', workout });
  } catch (error) {
    console.error('Error saving workout:', error);
    res.status(500).json({ error: 'Failed to save workout' });
  }
});

// Delete workout
app.delete('/api/workouts/:id', (req, res) => {
  try {
    deleteWorkout(req.params.id);
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

// Upload and parse PDF
app.post('/api/workouts/upload', upload.single('pdf'), async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing PDF:', req.file.originalname);
    console.log('File path:', req.file.path);
    console.log('File size:', req.file.size);

    // Parse the PDF
    const parsedWorkouts = await parsePDF(req.file.path);

    console.log('Parsed workouts count:', parsedWorkouts.length);

    if (!parsedWorkouts || parsedWorkouts.length === 0) {
      console.error('No workouts parsed from PDF');
      return res.status(400).json({ error: 'Failed to parse workout data from PDF. Make sure the PDF contains workout information with exercises, sets, and reps.' });
    }

    // Insert all workouts
    for (const workout of parsedWorkouts) {
      console.log('Inserting workout:', workout.workoutName || workout.fileName);
      insertWorkout(workout);
    }

    console.log(`Successfully created ${parsedWorkouts.length} workouts from PDF`);

    res.json({ 
      message: `Successfully created ${parsedWorkouts.length} workouts from PDF`,
      workouts: parsedWorkouts
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ 
      error: 'Failed to process PDF', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get workout sessions
app.get('/api/workouts/:id/sessions', (req, res) => {
  try {
    const sessions = getWorkoutSessions(req.params.id);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Save workout session
app.post('/api/sessions', (req, res) => {
  try {
    const { workoutId, date, sessionData } = req.body;

    if (!workoutId || !date || !sessionData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session: WorkoutSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workoutId,
      date,
      sessionData,
      createdAt: new Date().toISOString()
    };

    insertWorkoutSession(session);

    res.json({ message: 'Session saved successfully', session });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadDir}`);
});
