# GitHub & Deployment Setup Guide

Follow these steps to get your Amidaddy project on GitHub and deployed globally.

## Part 1: Prepare Your Local Code (5 minutes)

### Step 1: Remove Node Modules Before Pushing
```bash
cd website\ amidaddy
cd backend
rm -r node_modules
cd ../frontend
rm -r node_modules
cd ..
```

### Step 2: Verify .gitignore is Correct
```bash
cat .gitignore
```

Should contain:
```
node_modules/
.env
.env.local
data.json
backend/uploads/*
```

### Step 3: Initialize Git (if not already done)
```bash
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: Amidaddy ecommerce with 3D catalog"
```

## Part 2: Create GitHub Repository (5 minutes)

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `amidaddy`
3. Description: "3D Ecommerce platform with Shopify-like features"
4. Public (so it's accessible and deployable)
5. **Uncheck** "Initialize this repository with README" (we have one)
6. Click "Create repository"

### Step 2: Add Remote & Push
```bash
git remote add origin https://github.com/YOUR_USERNAME/amidaddy.git
git branch -M main
git push -u origin main

# If you get permission errors:
# Follow: https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories
```

### Step 3: Verify on GitHub
- Go to https://github.com/YOUR_USERNAME/amidaddy
- Should see all your files there
- Click on "Backend" folder to see the backend code

## Part 3: Deploy Frontend to Vercel (10 minutes)

### Step 1: Connect Vercel with GitHub
1. Go to https://vercel.com
2. Sign up / Log in with GitHub
3. Click "New Project"
4. Find and select your `amidaddy` repository
5. Click "Import"

### Step 2: Configure Project Settings
1. **Framework:** Next.js
2. **Root Directory:** Select `frontend`
3. Click "Edit" to change it if needed

### Step 3: Add Environment Variables
Before deploying:
1. Click "Environment Variables"
2. Add new variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `http://localhost:5000` (we'll change this after backend is live)
3. Click "Add"

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-5 minutes for build
3. When complete, you'll see: "Congratulations! Your project has been successfully deployed"
4. Click the URL to see your frontend live!

**Your Frontend URL will look like:**
```
https://amidaddy.vercel.app
```

## Part 4: Deploy Backend to Render (15 minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Click "New +" button

### Step 2: Create Web Service
1. Select "Web Service"
2. Connect your GitHub account if prompted
3. Find and select your `amidaddy` repository
4. Fill in settings:

   | Field | Value |
   |-------|-------|
   | Name | `amidaddy-backend` |
   | Environment | `Node` |
   | Region | `Oregon` (or closest to you) |
   | Branch | `main` |
   | Build Command | `cd backend && npm install` |
   | Start Command | `cd backend && npm run dev` |
   | Root Directory | Leave blank (Render handles it) |

### Step 3: Add Environment Variables
1. Scroll to "Environment Variables"
2. Add each variable:
   ```
   PORT=5000
   JWT_SECRET=your_random_secret_string_here_min_32_chars
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   NODE_ENV=production
   CORS_ORIGIN=https://amidaddy.vercel.app
   ```

### Step 4: Create Service
1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. When ready, you'll see a green "Live" indicator

**Your Backend URL will look like:**
```
https://amidaddy-backend.onrender.com
```

### Step 5: Seed the Database
1. In Render dashboard, click "Shell" tab
2. Run:
   ```bash
   cd backend && npm run seed
   ```
3. You should see: "✅ Seed complete"

## Part 5: Connect Frontend & Backend (5 minutes)

### Step 1: Get Your Backend URL
1. Go to Render dashboard
2. Copy your web service URL (something like `https://amidaddy-backend.onrender.com`)

### Step 2: Update Vercel Environment Variable
1. Go to https://vercel.com
2. Select your `amidaddy` project
3. Go to Settings → Environment Variables
4. Find `NEXT_PUBLIC_API_URL`
5. Change the value to your Render backend URL:
   ```
   https://amidaddy-backend.onrender.com
   ```
6. Click "Save"
7. Vercel will auto-redeploy with the new variable

### Step 3: Update Backend CORS
1. On your local machine, edit `backend/src/app.js`
2. Find the CORS section and update:
   ```javascript
   const allowedOrigins = [
     'http://localhost:3000',
     'https://amidaddy.vercel.app',  // ← Add your Vercel URL
     process.env.CORS_ORIGIN
   ];
   ```
3. Push to GitHub:
   ```bash
   git add backend/src/app.js
   git commit -m "Update CORS for Vercel URL"
   git push
   ```
4. Render will auto-redeploy

## Part 6: Test Your Deployment (5 minutes)

### Test Frontend
1. Go to https://amidaddy.vercel.app
2. You should see your homepage
3. Products should load

### Test Backend Connection
1. Open browser DevTools (F12)
2. Go to Console tab
3. Should NOT see CORS errors
4. Products should display with images

### Test Product Page
1. Click on any product
2. Should see:
   - Product image
   - Product details
   - 3D viewer
   - Price in ₹

### Test API Directly
```bash
# In terminal, test your backend:
curl https://amidaddy-backend.onrender.com/api/products
```

Should return your products as JSON.

## Part 7: Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update your domain's DNS settings (Vercel provides instructions)

### Add Custom Domain to Render
Similar process - Render Dashboard → Web Service → Settings → Custom Domain

## 🎉 You're Done!

Your Amidaddy ecommerce platform is now live globally!

- **Frontend:** https://amidaddy.vercel.app
- **Backend:** https://amidaddy-backend.onrender.com
- **Repository:** https://github.com/YOUR_USERNAME/amidaddy

### Next Steps
1. Test all features
2. Add products in admin
3. Configure Stripe for real payments
4. Monitor logs for errors
5. Update README with your live URLs

## Troubleshooting

### Build Failed on Vercel
- Check "Deployments" tab for error logs
- Common cause: Wrong root directory (should be `frontend`)
- Solution: Fix and push again

### Backend Not Responding
- Check Render logs: Web Service → Logs
- Common cause: Environment variables missing
- Solution: Add all required env vars and redeploy

### Images Not Loading
- Check browser console (F12) for error messages
- Verify backend is responding: `https://amidaddy-backend.onrender.com/api/products`
- Check CORS configuration

### Database Empty
- In Render Shell, run: `npm run seed`
- Render may restart the server; data will persist if in data.json

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Next.js Docs: https://nextjs.org/docs
- Express Docs: https://expressjs.com/

---

**Questions?** Check the main [DEPLOYMENT.md](./DEPLOYMENT.md) or create a GitHub Issue!
