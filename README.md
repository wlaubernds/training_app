# Workout Tracker App

A personal workout tracking application designed for athletes following structured training programs. Upload your weekly workout PDFs and the app automatically parses exercises, then allows you to log weights, reps, and notes for each set to track progress week over week.

![Workout Tracker](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ Features

- 📄 **Smart PDF Parsing**: Automatically extracts exercises, sets, reps, and workout metadata from PDF files
- 📋 **Workout Organization**: Filters by program, phase, and week for easy navigation
- 💪 **Session Tracking**: Log weights and reps for each set with automatic comparison to previous sessions
- 📊 **Historical Comparison**: See your previous performance right next to your current workout
- 🎨 **Modern UI**: Beautiful, responsive design built with Figma and implemented with Shadcn/ui components
- 📝 **Exercise Categories**: Workouts are organized by blocks (Warmup, Buy-in, Block 1-4, Cooldown)
- 🔄 **Session History**: Track all your workout sessions with date stamps

## 🎯 Use Case

Perfect for athletes following structured training programs that provide weekly workout PDFs. The app is specifically designed to handle workout formats with:
- Multiple days per week (Monday-Friday)
- Block-based training (Warmup, Buy-in, Main blocks, Cooldown)
- Various rep schemes (time-based, rep-based, AMRAP)
- Equipment requirements
- Training phases and weekly progression

## 📱 Use at the Gym

**Want to access this on your phone at the gym?** Check out **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment instructions!

Quick options:
- 🚂 **Railway** - Deploy both frontend & backend in 5 minutes (free tier)
- ▲ **Vercel + Render** - Split deployment (completely free)
- 🏠 Add to your phone's home screen for app-like experience

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Vite** for fast development
- **Sonner** for toast notifications

### Backend
- **Node.js** + **Express**
- **TypeScript** throughout
- **SQLite** database (local, zero-config)
- **pdf-parse** for PDF extraction
- **multer** for file uploads

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/wlaubernds/training_app.git
cd training_app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
npm run setup-db
```

4. **Start the development servers**
```bash
npm run dev
```

This will start:
- Frontend on **http://localhost:5173**
- Backend API on **http://localhost:3001**

## 📱 Usage

### Uploading Workout PDFs

1. Click **"Upload PDF"** button on the workout list page
2. Select your workout PDF file
3. The app automatically:
   - Detects all 5 workout days (Monday-Friday)
   - Extracts program name, phase, and week number
   - Parses all exercises with sets and reps
   - Organizes exercises by block/category
   - Identifies required equipment

### Tracking a Workout

1. Click on any workout from the list
2. Select a date for your session (defaults to today)
3. For each exercise:
   - Enter the weight you used
   - Log reps completed for each set
   - Add optional notes
   - Mark sets as completed with checkboxes
4. See your previous session data displayed alongside for comparison
5. Click **"Save Session"** when done

### Creating/Editing Workouts Manually

1. Click **"Create Workout"** or edit icon on any workout
2. Enter workout details:
   - Workout name and day
   - Program, phase, and week
   - Equipment needed
3. Add exercises with:
   - Exercise name
   - Number of sets
   - Rep scheme (can be numbers, ranges, time, or "AMRAP")
   - Category/block assignment

## 📁 Project Structure

```
training-app/
├── src/                          # React frontend
│   ├── pages/                    # Page components
│   │   ├── WorkoutList.tsx       # Main workout list with filters
│   │   ├── WorkoutBuilder.tsx    # Create/edit workouts
│   │   └── WorkoutTracker.tsx    # Log workout sessions
│   ├── components/ui/            # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── lib/
│   │   └── utils.ts              # Utility functions
│   ├── App.tsx                   # Main app with routing
│   ├── types.ts                  # TypeScript types
│   └── index.css                 # Global styles + design system
├── server/                       # Express backend
│   ├── db/
│   │   ├── setup.ts              # Database schema initialization
│   │   └── database.ts           # Database queries
│   ├── utils/
│   │   └── pdfParser.ts          # PDF parsing logic
│   └── index.ts                  # API server
├── uploads/                      # Uploaded PDFs (gitignored)
├── workouts.db                   # SQLite database (gitignored)
├── package.json                  # Dependencies and scripts
└── vite.config.ts                # Vite configuration
```

## 🔌 API Endpoints

### Workouts
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/:id` - Get single workout with exercises
- `POST /api/workouts` - Create/update workout
- `DELETE /api/workouts/:id` - Delete workout
- `POST /api/workouts/upload` - Upload and parse PDF

### Sessions
- `GET /api/workouts/:id/sessions` - Get all sessions for a workout
- `POST /api/sessions` - Create new workout session

## 💾 Database Schema

### `workouts`
```sql
- id (TEXT, PRIMARY KEY)
- file_name (TEXT)
- upload_date (TEXT)
- workout_name (TEXT)
- workout_day (TEXT)
- program (TEXT)
- phase (TEXT)
- week (TEXT)
- equipment (TEXT, JSON array)
- created_at (TEXT)
```

### `exercises`
```sql
- id (TEXT, PRIMARY KEY)
- workout_id (TEXT, FOREIGN KEY)
- name (TEXT)
- sets (INTEGER)
- reps (TEXT)
- category (TEXT)
- notes (TEXT)
- created_at (TEXT)
```

### `workout_sessions`
```sql
- id (TEXT, PRIMARY KEY)
- workout_id (TEXT, FOREIGN KEY)
- date (TEXT)
- created_at (TEXT)
```

### `exercise_sessions`
```sql
- id (TEXT, PRIMARY KEY)
- session_id (TEXT, FOREIGN KEY)
- exercise_id (TEXT, FOREIGN KEY)
- notes (TEXT)
- created_at (TEXT)
```

### `set_data`
```sql
- id (INTEGER, PRIMARY KEY)
- exercise_session_id (TEXT, FOREIGN KEY)
- set_number (INTEGER)
- weight (REAL)
- reps (INTEGER)
- completed (INTEGER, boolean)
```

## 🎨 Design System

The app uses a custom design system with:
- **Colors**: Primary (near-black), Secondary (light purple), Muted (gray tones)
- **Typography**: System fonts with 4 heading levels
- **Border Radius**: 10px (0.625rem)
- **Components**: Built with Shadcn/ui and customized to match Figma design

## 📝 PDF Format Support

The parser handles workout PDFs with this structure:
```
MONDAY (Hinge/Push)
GYM DAILY - IN SEASON WEEK 11
Equipment: Rack, Barbell, Bench, ...

Warmup: x 2
Exercise Name x Reps
...

BUY-IN: 5 Min AMRAP
Exercise Name x Reps
...

BLOCK 1: E2MOM x 4 Rounds
Exercise Name x Reps
...

Cool Down:
Exercise Name x Reps
```

The parser extracts:
- Day name and workout type (e.g., "MONDAY - Hinge/Push")
- Program, phase, and week (e.g., "GYM DAILY", "IN SEASON", "Week 11")
- Equipment requirements
- Exercises grouped by category
- Set counts from section headers (e.g., "x 2", "E2MOMx 4 Rounds")

## 🚧 Future Enhancements

- [ ] Exercise history charts and progress graphs
- [ ] Personal records tracking (1RM, max reps, etc.)
- [ ] Workout templates for quick creation
- [ ] Exercise library with form videos
- [ ] Export data to CSV/PDF
- [ ] Mobile-responsive improvements
- [ ] Dark mode support
- [ ] Multiple user support with authentication
- [ ] Cloud sync option

## 🤝 Contributing

This is a personal project, but feel free to fork it and adapt it to your needs! If you have suggestions or improvements, open an issue or pull request.

## 📄 License

MIT License - feel free to use this for your own training tracking!

## 🙏 Acknowledgments

- Built with guidance from Claude (Anthropic)
- UI design created in Figma
- Component library from [Shadcn/ui](https://ui.shadcn.com/)

---

**Made with 💪 for structured training programs**
