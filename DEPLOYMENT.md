# Deployment Guide

This guide will help you deploy your Workout Tracker app so you can access it from your phone at the gym.

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

[Railway](https://railway.app) can deploy both frontend and backend with a few clicks and gives you $5/month free credit.

#### Steps:

1. **Sign up** at [railway.app](https://railway.app) with your GitHub account

2. **Create a new project** → "Deploy from GitHub repo"

3. **Select** your `training_app` repository

4. Railway will auto-detect and deploy both services

5. **Add environment variables** in Railway dashboard:
   - For the backend service:
     - `NODE_ENV` = `production`
     - `PORT` = `3001`

6. **Get your URLs**:
   - Railway will give you a URL for your backend (e.g., `https://workout-api.railway.app`)
   - And a URL for your frontend (e.g., `https://workout-tracker.railway.app`)

7. **Update frontend to use backend URL**:
   - In Railway, add environment variable to frontend service:
     - `VITE_API_URL` = `your-backend-url`

8. **Done!** Visit your frontend URL on your phone and save it to your home screen

**Cost**: Free for ~$5/month worth of usage, then $5/month for more

---

### Option 2: Vercel (Frontend) + Render (Backend)

Split deployment - Vercel for frontend (super fast), Render for backend (free tier).

#### Backend on Render:

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: workout-tracker-api
   - **Environment**: Node
   - **Build Command**: `npm install && npm run setup-db`
   - **Start Command**: `node --loader tsx server/index.ts`
   - **Environment Variables**:
     - `NODE_ENV` = production
     - `PORT` = 3001
5. Click "Create Web Service"
6. Copy your backend URL (e.g., `https://workout-tracker-api.onrender.com`)

#### Frontend on Vercel:

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New" → "Project"
3. Import your `training_app` repo
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL` = your-render-backend-url
5. Click "Deploy"
6. Your app will be live at `https://workout-tracker.vercel.app`

**Cost**: Completely free!

---

### Option 3: Single VPS (Advanced)

Deploy to a VPS like [DigitalOcean](https://digitalocean.com) or [Linode](https://linode.com) if you want full control.

#### Requirements:
- Basic Linux/SSH knowledge
- ~$5-10/month

#### Quick Setup:

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Clone and setup
git clone https://github.com/wlaubernds/training_app.git
cd training_app
npm install
npm run setup-db

# Build frontend
npm run build

# Start backend with PM2
pm2 start "node --loader tsx server/index.ts" --name workout-api

# Install and configure Nginx
apt-get install -y nginx

# Create Nginx config (see below)
nano /etc/nginx/sites-available/workout-tracker
```

**Nginx Config** (`/etc/nginx/sites-available/workout-tracker`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /root/training_app/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then:
```bash
# Enable site
ln -s /etc/nginx/sites-available/workout-tracker /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Install SSL with Let's Encrypt
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## 📱 Make it App-Like on Your Phone

### iOS (Safari):

1. Open your deployed URL in Safari
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Workout Tracker"
5. Tap "Add"

Now it will appear as an app icon on your home screen!

### Android (Chrome):

1. Open your deployed URL in Chrome
2. Tap the **three-dot menu** (⋮)
3. Tap **"Add to Home screen"**
4. Name it "Workout Tracker"
5. Tap "Add"

The icon will appear on your home screen like a native app!

---

## 🔐 Optional: Add Simple Authentication

If you want to protect your workout data:

1. Add HTTP Basic Auth at the server level (Nginx/Cloudflare)
2. Or implement user authentication with [Supabase](https://supabase.com) (free tier available)

---

## 💾 Database Persistence

**Important**: SQLite database needs to persist between deployments!

### On Railway/Render:
- Enable "Persistent Disks" in your service settings
- Mount to `/app/workouts.db`

### On Vercel:
- Frontend is static, but you need backend elsewhere
- Use Railway/Render for backend with persistent storage

### Alternative: Use PostgreSQL
For production at scale, consider migrating to PostgreSQL (free tier on [Supabase](https://supabase.com) or [Neon](https://neon.tech))

---

## 🧪 Testing Your Deployment

1. Visit your deployed URL on desktop first
2. Upload a PDF workout
3. Check that it parses correctly
4. Log a workout session
5. Open the URL on your phone
6. Add to home screen
7. Test at the gym! 💪

---

## ⚡ Performance Tips

1. **Enable caching** on your CDN (Vercel/Netlify do this automatically)
2. **Compress PDFs** before uploading to save bandwidth
3. **Use service workers** for offline capability (advanced)
4. **Enable HTTPS** (most platforms do this by default)

---

## 🐛 Troubleshooting

**Issue**: API requests fail from deployed frontend
- **Solution**: Make sure `VITE_API_URL` environment variable is set correctly

**Issue**: Database resets on each deployment
- **Solution**: Enable persistent storage/volumes

**Issue**: PDF upload fails (413 error)
- **Solution**: Increase max upload size in server config

**Issue**: App is slow on mobile
- **Solution**: Optimize images, enable gzip compression, use CDN

---

## 📊 Monitoring (Optional)

- Use Railway/Render built-in logs
- Add [Sentry](https://sentry.io) for error tracking
- Use [Plausible](https://plausible.io) for privacy-friendly analytics

---

**Questions?** Open an issue on [GitHub](https://github.com/wlaubernds/training_app/issues)

