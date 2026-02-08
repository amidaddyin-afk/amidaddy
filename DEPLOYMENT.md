# Deployment Guide - Amidaddy.in

This guide explains how to deploy Amidaddy to GitHub and then to production using free services.

## Table of Contents
1. [GitHub Setup](#github-setup)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Render/Railway)](#backend-deployment-renderrailway)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Setup](#post-deployment-setup)

---

## GitHub Setup

### Step 1: Initialize Git Repository

```bash
# In your project root
git init
git add .
git commit -m "Initial commit: Amidaddy ecommerce with 3D catalog"
```

### Step 2: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `amidaddy` (or your preferred name)
3. **Do NOT initialize with README** (we already have one)
4. Copy the repository URL

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/amidaddy.git
git branch -M main
git push -u origin main
```

### Important Files for GitHub

Make sure these files are committed:
- `.gitignore` - Excludes node_modules, .env, data.json
- `README.md` - Project documentation
- `backend/.env.example` - Template for environment variables
- `frontend/.env.example` - Template for frontend env vars (if needed)

---

## Frontend Deployment (Vercel)

Vercel is the best choice for Next.js applications - it's made by the Next.js creators and is free!

### Step 1: Prepare Frontend

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Click "New Project"
4. Select your GitHub repository
5. Select `frontend` folder as the root directory

### Step 2: Configure Environment Variables

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
   (You'll add the backend URL after deploying the backend)

### Step 3: Deploy

- Vercel automatically deploys on every push to main
- Your frontend will be live at `https://amidaddy.vercel.app` (or your custom domain)

---

## Backend Deployment (Render/Railway)

### Option A: Using Render (Recommended)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** `amidaddy-backend`
   - **Environment:** Node
   - **Build Command:** `npm install` (already in backend folder)
   - **Start Command:** `npm run dev` (or `node src/server.js`)
   - **Root Directory:** `backend`

6. Add Environment Variables:
   ```
   PORT=5000
   JWT_SECRET=your_secure_random_string_here
   STRIPE_SECRET_KEY=sk_test_your_key
   NODE_ENV=production
   ```

7. Deploy - Your backend will be at `https://amidaddy-backend.onrender.com`

### Option B: Using Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → GitHub repo
4. Select your repository
5. Railway auto-detects the project structure
6. Add environment variables (same as above)
7. Deploy

---

## Environment Configuration

### Backend (.env)

```properties
# Backend environment variables
PORT=5000
JWT_SECRET=your_random_secret_string_min_32_characters
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
NODE_ENV=production
CORS_ORIGIN=https://amidaddy.vercel.app
```

### Frontend (.env.local)

```properties
NEXT_PUBLIC_API_URL=https://amidaddy-backend.onrender.com
```

---

## Post-Deployment Setup

### Step 1: Update Frontend Environment Variable

After deploying the backend:
1. Go to Vercel Dashboard
2. Select your project → Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your actual backend URL
4. Redeploy

### Step 2: Seed Initial Data

After backend is deployed:

```bash
# Option A: SSH into Render/Railway
# And run: npm run seed

# Option B: Create a `/api/seed` endpoint in your backend
# Then call it via curl or your frontend
```

### Step 3: Update CORS

In `backend/src/app.js`, update CORS configuration:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://amidaddy.vercel.app',
  process.env.CORS_ORIGIN
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## Database & File Persistence

### How It Works

- The JSON database (`data.json`) is stored locally on your backend server
- Files persist across deployments on Render (with limitations)
- Images in `/products` folder are committed to GitHub

### Important Notes

- **Data Limitations:** If your backend server restarts, any new data created after the last seed might be lost
- **Solution:** For production, consider upgrading to a proper database (MongoDB Atlas free tier, or PostgreSQL)
- **Products Images:** Your product images in `/products` folder are safe (they're in GitHub)

---

## Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] `.gitignore` properly configured
- [ ] Backend URL obtained from Render/Railway
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable set to backend URL
- [ ] Backend environment variables configured
- [ ] Database seeded with initial products
- [ ] CORS configured for production URLs
- [ ] Test endpoints: `https://backend-url/api/products`
- [ ] Test frontend: Load products and images

---

## Troubleshooting

### Images Not Loading
- Check CORS configuration
- Verify static file serving in `backend/src/app.js`
- Ensure `/products` folder exists in backend

### Database Empty After Reboot
- Render restarts servers periodically
- Data needs to be reseeded
- Consider upgrading to persistent database

### Frontend Can't Reach Backend
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS settings on backend
- Check browser console for network errors

### Build Fails on Vercel
- Make sure `frontend` folder is set as root directory
- Check `next.config.js` for any issues
- View Vercel logs for specific errors

---

## Next Steps

1. Push code to GitHub
2. Deploy frontend to Vercel
3. Deploy backend to Render
4. Update environment variables
5. Test full workflow
6. Monitor for errors in browser console

**Support:**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Next.js Docs: https://nextjs.org/docs
