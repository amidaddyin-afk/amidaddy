# Windows Users Guide - Deploy Amidaddy to GitHub

Complete guide for Windows PowerShell users to deploy the project.

## Prerequisites

- Node.js 18+ installed: https://nodejs.org/
- Git installed: https://git-scm.com/
- GitHub account: https://github.com/signup

**Verify Installation:**
```powershell
node --version      # Should show v18+
npm --version       # Should show 9+
git --version       # Should show 2.40+
```

---

## Part 1: Prepare Your Code (Windows)

### Step 1: Open PowerShell as Admin
- Press **Windows Key**
- Type `PowerShell`
- Right-click "Windows PowerShell"
- Click "Run as administrator"

### Step 2: Navigate to Your Project
```powershell
cd "G:\website amidaddy"
```

### Step 3: Clean Up Before Pushing
```powershell
# Remove node_modules (saves bandwidth)
cd backend
rm -Recurse -Force node_modules -ErrorAction SilentlyContinue
cd ..\frontend
rm -Recurse -Force node_modules -ErrorAction SilentlyContinue
cd ..
```

### Step 4: Check .gitignore
```powershell
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

---

## Part 2: Create GitHub Repository

### Step 1: Create Repository Online
1. Go to https://github.com/new
2. **Repository name:** `amidaddy`
3. **Description:** `3D Ecommerce platform with interactive product visualization`
4. **Public** (so it can be deployed)
5. **Uncheck:** "Initialize this repository with README"
6. Click **"Create repository"**

### Step 2: Configure Git Locally
```powershell
# Go to your project folder
cd "G:\website amidaddy"

# Configure Git user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository (if not done)
git init
```

### Step 3: Add Files and Commit
```powershell
git add .
git commit -m "Initial commit: Amidaddy 3D ecommerce with Stripe payments"
```

**If you get an error about user.name/email:**
```powershell
git config user.name "Your Name"
git config user.email "your.email@example.com"
git commit -m "Initial commit"
```

### Step 4: Connect to GitHub
```powershell
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/amidaddy.git
git branch -M main
git push -u origin main
```

**If you get permission error:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: repo, workflow
4. Copy the token
5. Run: `git push -u origin main`
6. When prompted for password, paste the token

**Alternative - Use GitHub Desktop:**
- Download: https://desktop.github.com/
- Much easier for Windows users!

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select your `amidaddy` repository
3. Click "Import"

### Step 3: Configure
- **Framework Preset:** Next.js
- **Root Directory:** Click "Edit" and select `frontend`
- Click "Save"

### Step 4: Add Environment Variable
1. Click "Environment Variables"
2. **Name:** `NEXT_PUBLIC_API_URL`
3. **Value:** `http://localhost:5000` (temporary)
4. Click "Add"

### Step 5: Deploy!
1. Click "Deploy"
2. Wait 2-5 minutes
3. You'll see "Congratulations!" when done
4. Copy the URL: `https://amidaddy.vercel.app`

**Save this URL - you'll need it later!**

---

## Part 4: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com/auth/signup
2. Click "Sign up with GitHub"
3. Authorize Render

### Step 2: Create Web Service
1. Click "New +" in top right
2. Select "Web Service"
3. Select your `amidaddy` repository
4. Click "Connect"

### Step 3: Configure Settings
Fill in these exact values:

| Setting | Value |
|---------|-------|
| Name | `amidaddy-backend` |
| Environment | `Node` |
| Region | `Oregon` (or pick closest) |
| Branch | `main` |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && npm run dev` |

### Step 4: Add Environment Variables
Click "Advanced" → "Add Environment Variable" for each:

```
KEY: PORT
VALUE: 5000

KEY: JWT_SECRET
VALUE: (generate random: Run in PowerShell)
```

**Generate JWT_SECRET in PowerShell:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Minimum 1000000 -Maximum 9999999).ToString() + (Get-Date).Ticks))
```

Add remaining variables:
```
KEY: STRIPE_SECRET_KEY
VALUE: sk_test_your_stripe_key

KEY: NODE_ENV
VALUE: production

KEY: CORS_ORIGIN
VALUE: https://amidaddy.vercel.app
```

### Step 5: Create Service
1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. You'll see a green "Live" badge
4. Your backend URL: Click the URL at top

**Save this URL - format like:** `https://amidaddy-backend.onrender.com`

---

## Part 5: Seed the Database

### In Render Dashboard:
1. Click your `amidaddy-backend` service
2. Click "Shell" tab
3. Copy and paste:
   ```bash
   cd backend && npm run seed
   ```
4. Press Enter
5. You should see: `✅ Seed complete`

---

## Part 6: Connect Frontend to Backend

### In Vercel Dashboard:
1. Go to your project
2. Click "Settings"
3. Click "Environment Variables"
4. Find `NEXT_PUBLIC_API_URL`
5. Change value to your Render URL: `https://amidaddy-backend.onrender.com`
6. Click "Save"
7. Vercel auto-redeploys in 1-2 minutes ✅

---

## 🎉 Test Your Deployment

### Test Frontend
```powershell
# Open in browser
Start-Process "https://amidaddy.vercel.app"
```

Should see:
- Homepage with 3D showcase
- "Featured products" section
- Product cards with images

### Test Product Page
1. Click on any product
2. You should see:
   - Product image
   - Product details
   - Add to cart button
   - 3D viewer with your image

### Test Backend Connection
Open PowerShell and run:
```powershell
curl "https://amidaddy-backend.onrender.com/api/products" | ConvertFrom-Json | ConvertTo-Json
```

Should show your 4 products (Billionaire, Cold War, Heavenly, Old Love)

---

## 📚 Quick Commands Reference

```powershell
# Navigate to project
cd "G:\website amidaddy"

# Git commands
git status              # Check current status
git add .              # Stage all changes
git commit -m "msg"    # Commit changes
git push               # Push to GitHub
git pull               # Pull from GitHub
git log --oneline -5   # See recent commits

# Node commands
npm install            # Install dependencies
npm run dev            # Run in development
npm run build          # Build for production
npm run seed           # Seed database (backend only)

# Check ports
netstat -ano | Select-String ":3000"
netstat -ano | Select-String ":5000"
```

---

## 🆘 Troubleshooting on Windows

### Git Push Fails - Permission Denied
**Solution:**
1. Go to https://github.com/settings/tokens
2. Create new token with `repo` access
3. Copy token
4. When asked for password, paste token instead

### PowerShell Execution Policy Error
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Node/npm Command Not Found
**Solution:**
1. Restart PowerShell completely
2. Close and reopen as Administrator
3. Reinstall Node.js from nodejs.org

### Can't Find Project Folder
```powershell
# List what's in G:\
ls G:\

# Navigate correctly
cd "G:\website amidaddy"
```

### Port 3000/5000 Already in Use
```powershell
# Find what's using the port
Get-Process | Where-Object {$_.Name -eq "node"}

# Kill the process
Get-Process -Name "node" | Stop-Process -Force
```

### Frontend Shows Blank/Can't Load Images
**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` in Vercel is correct
2. Check browser console: Press F12 → Console
3. Look for red error messages
4. Make sure backend is running on Render

---

## 📝 Key Windows-Specific Notes

1. **File Paths:** Use backslashes or quotes for spaces
   ```powershell
   cd "G:\website amidaddy"    # Correct
   cd G:/website amidaddy      # Also works (forward slash)
   cd G:\website amidaddy      # Needs quotes if there's a space
   ```

2. **Environment Variables:** On Windows, sensitive data is case-insensitive
   - `JWT_SECRET` = `jwt_secret` (both work)

3. **File Permissions:** Admin PowerShell might be needed for some operations

4. **GitHub Desktop:** Windows users might prefer GitHub Desktop over command line
   - https://desktop.github.com/
   - Easier visual interface

---

## 🔄 Making Updates

After deployment, to update your live site:

```powershell
# Make changes to files
# Then push to GitHub:

git add .
git commit -m "Update: [what changed]"
git push

# Automatic!
# Vercel rebuilds frontend: 2-3 minutes
# Render rebuilds backend: 3-5 minutes
# Your changes are live!
```

---

## 🌐 Your Live URLs

After deployment:
- **Frontend:** `https://amidaddy.vercel.app`
- **Backend:** `https://amidaddy-backend.onrender.com`
- **Repository:** `https://github.com/YOUR_USERNAME/amidaddy`
- **Admin Login:** 
  - Email: `admin@amidaddy.in`
  - Password: `Admin@123`

---

## 💡 Windows-Specific Tips

1. **Use VS Code Terminal:** Open VS Code → Terminal → It detects PowerShell
2. **Right-click Menu:** In folder, Shift+Right-click → "Open PowerShell here"
3. **Copy-Paste:** Right-click in PowerShell or Ctrl+Shift+V
4. **Clear Screen:** `Clear-Host` or `cls`
5. **Admin Mode:** Right-click PowerShell → "Run as administrator"

---

## ✅ Windows Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed and configured
- [ ] Project files are ready (node_modules removed)
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub (`git push`)
- [ ] Vercel project created and deployed
- [ ] Render backend created and deployed
- [ ] Environment variables set correctly
- [ ] Database seeded (`npm run seed`)
- [ ] Frontend URL shows products
- [ ] Backend API responds with data
- [ ] Product page loads with image
- [ ] No CORS errors in browser console

---

## Next Steps

1. ✅ Follow this guide step-by-step
2. ✅ Test your live site
3. ✅ Share the URL with others
4. ✅ Configure Stripe for real payments (optional)
5. ✅ Add custom domain (optional)

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **GitHub Help:** https://docs.github.com
- **Node.js Docs:** https://nodejs.org/docs/

**You've got this! 🚀**

---

**Stuck?** Check the other documentation:
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Quick overview
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Detailed steps
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
