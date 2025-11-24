# Challenge Weeks Implementation

## Overview
This implementation adds support for "Challenge Week" workouts, which are special end-of-phase workouts with unique formats, named workouts (e.g., "DEADFALL", "DRAINAGE"), and specific scoring criteria.

## Changes Made

### 1. Type Definitions (`src/types.ts`)
Added new optional fields to the `Workout` interface:
- `isChallenge?: boolean` - Flag to identify challenge week workouts
- `workoutTitle?: string` - Named workout title (e.g., "DEADFALL", "DRAINAGE")
- `timeCap?: string` - Time cap for the workout (e.g., "30 minutes")
- `scoringType?: string` - How the workout is scored (e.g., "Time", "Rounds + Reps", "Distance")

### 2. PDF Parser (`server/utils/pdfParser.ts`)
Enhanced the PDF parser to detect and parse challenge week format:
- Detects "CHALLENGE WEEK" pattern in PDF text
- Extracts challenge-specific metadata (workout titles, time caps, scoring)
- Handles different day format (no parentheses after day name)
- Parses date-based week format (e.g., "11/24-11/28" instead of "Week 11")
- Automatically sets `phase` to "Challenge Week" for these workouts

### 3. Workout List (`src/pages/WorkoutList.tsx`)
Enhanced workout display:
- Shows amber "Challenge Week" badge with award icon
- Displays workout title prominently (larger, bold font)
- Shows time cap information with clock emoji
- Maintains compatibility with regular workouts

### 4. Workout Tracker (`src/pages/WorkoutTracker.tsx`)
Enhanced tracking interface:
- Shows "Challenge Week" badge at top of workout
- Displays workout title as prominent heading
- Shows additional metadata: day, time cap, and scoring type
- All in one organized header section

### 5. Workout Builder (`src/pages/WorkoutBuilder.tsx`)
Added UI controls for challenge workouts:
- Checkbox to mark workout as "Challenge Week"
- Conditional fields that appear when challenge is checked:
  - Workout Title input
  - Time Cap input
  - Scoring Type input
- Fields are visually separated with amber accent border
- Maintains all existing workout builder functionality

## How It Works

### For PDF Uploads:
1. When a challenge week PDF is uploaded, the parser detects the "CHALLENGE WEEK" pattern
2. Extracts challenge-specific information (workout titles, time caps, scoring)
3. Creates workouts with `isChallenge: true` and additional metadata
4. Workouts display with challenge badges and titles in the workout list

### For Manual Entry:
1. Users can check the "Challenge Week Workout" checkbox in the builder
2. Additional fields appear for entering challenge-specific data
3. Saved workouts will display with challenge styling

### For Tracking:
1. Challenge workouts show distinct visual styling
2. All tracking functionality remains the same
3. Users can still track sets, reps, and weights as usual

## Testing the Implementation

To test with the provided challenge week PDF:
1. Upload `gym-challenge-week-2-0-11-24-11-28.pdf`
2. Parser should detect it as challenge week
3. Each day should be extracted as a separate workout with:
   - Challenge badge
   - Workout title (DEADFALL, DRAINAGE, etc.)
   - Time cap where applicable
   - Proper exercise categorization

## Backward Compatibility

All changes are backward compatible:
- Existing workouts continue to work without modification
- New fields are optional
- UI gracefully handles workouts with or without challenge data
- No database migrations required (using JSON storage)

## Future Enhancements

Potential improvements for future iterations:
- Challenge leaderboard/scoring tracking
- Historical challenge performance comparisons
- Challenge-specific analytics
- Custom categories for challenge blocks (BUY-IN, BLOCK 1, etc.)

