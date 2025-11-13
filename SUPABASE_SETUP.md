# Supabase Setup Guide

This guide will walk you through setting up Supabase for your Workout Tracker app.

## 🚀 Quick Start

### Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### Step 2: Create a New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Enter project details:
   - **Name**: `workout-tracker` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### Step 3: Set Up Database Tables

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy and paste the entire contents of `supabase-schema.sql` from your project root
4. Click **Run** or press `Cmd/Ctrl + Enter`
5. You should see "Success. No rows returned" - this is correct!

### Step 4: Get Your API Credentials

1. In your Supabase dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** under "Project Settings"
3. You'll see two important values:
   - **Project URL**: Starts with `https://xxxxx.supabase.co`
   - **anon public** key: A long string starting with `eyJ...`

### Step 5: Configure Environment Variables

1. In your project root, create a `.env` file:

```bash
# Copy the example file
cp env.example .env
```

2. Open `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here

# Optional: Service key for backend (more secure)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-key-here

PORT=3001
NODE_ENV=development
```

3. **Important**: Replace `YOUR_PROJECT_ID` and the keys with your actual values from Step 4

### Step 6: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Scroll down to **Email Templates** (optional)
   - Customize your sign-up confirmation email if desired

### Step 7: Test Your Setup

1. Start your servers:

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend (in a new terminal)
cd /Users/wlaubernds/training-app && npm run dev:frontend
```

2. Open http://localhost:5173 in your browser
3. You should see the login screen
4. Click "Sign up" and create a test account
5. Check your email for confirmation (or check Supabase **Authentication** → **Users**)
6. Log in and upload a workout PDF to test!

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database tables created (run `supabase-schema.sql`)
- [ ] Environment variables configured in `.env`
- [ ] Can sign up and log in
- [ ] Can upload workout PDFs
- [ ] Can track workout sessions
- [ ] Data is isolated per user (create 2 accounts to test!)

## 🔐 Security Best Practices

### Row Level Security (RLS)
Your database is already secured with RLS policies! This means:
- Users can only see their own workouts
- Users can only modify their own data
- No user can access another user's information

### Environment Variables
**NEVER** commit your `.env` file to git! It's already in `.gitignore`, but double-check:

```bash
# Make sure .env is in .gitignore
grep ".env" .gitignore
```

### Production Deployment
When deploying to production (Railway, Render, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Optionally add `SUPABASE_SERVICE_KEY` for server-side operations

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart both frontend and backend servers after adding `.env`

### "Invalid or expired token"
- Make sure you've run the `supabase-schema.sql` script
- Check that RLS policies are enabled
- Try logging out and back in

### "Failed to parse workout data from PDF"
- This is unrelated to Supabase - the PDF parser needs workouts in a specific format
- Make sure your PDF has exercises with "x" notation (e.g., "Squat x 10")

### "Network error" or "Failed to fetch"
- Check that backend is running on port 3001: `lsof -i :3001`
- Check that frontend is running on port 5173
- Verify your `VITE_SUPABASE_URL` is correct

### Can't sign up - "Email not confirmed"
- Check your email inbox for confirmation link
- Or go to Supabase dashboard → **Authentication** → **Users** → click user → **Confirm Email**
- For development, you can disable email confirmation:
  - Go to **Authentication** → **Providers** → **Email**
  - Disable "Confirm email"

## 📱 Deployment with Supabase

When deploying to Railway, Render, or Vercel, you'll need to:

1. **Add environment variables** in your hosting platform:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **No database setup needed!** Supabase hosts your database, so you don't need:
   - ❌ SQLite file
   - ❌ Database migrations on deploy
   - ❌ Persistent storage for database

3. **Access from anywhere** - Your workouts are stored in Supabase cloud, so you can access them from:
   - Your desktop app
   - Your phone at the gym
   - Any device with internet

## 🎉 You're All Set!

Your workout tracker now has:
- ✅ Cloud database (no more local SQLite file)
- ✅ User authentication (sign up, login, logout)
- ✅ Multi-device sync (access from anywhere)
- ✅ Data isolation (each user sees only their own workouts)
- ✅ Secure API (JWT-based authentication)

Happy tracking! 💪

