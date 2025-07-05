# 🚀 GitHub Setup Guide

## Step-by-Step Instructions to Upload Your Project to GitHub

### **Step 1: Install Git**
1. Download Git from: https://git-scm.com/download/win
2. Install with default settings
3. Restart your terminal/PowerShell

### **Step 2: Create GitHub Repository**
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `resto-pos-system`
   - **Description**: `Restaurant POS System with React, Node.js, and PostgreSQL`
   - **Visibility**: Public (or Private if you prefer)
   - **Don't** initialize with README (we'll push our existing code)
4. Click **"Create repository"**

### **Step 3: Initialize Your Local Repository**

After installing Git, open PowerShell in your project directory and run:

```powershell
# Configure Git with your information
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Restaurant POS System"

# Add GitHub as remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/resto-pos-system.git

# Set main as default branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### **Step 4: Verify Upload**
1. Go to your GitHub repository URL
2. You should see all your project files uploaded
3. The README.md will display on the main page

---

## 🔄 **Syncing Between Computers**

### **On Your Current Computer (Daily Work)**

```powershell
# Before starting work, pull latest changes
git pull origin main

# Make your changes...

# When ready to save changes
git add .
git commit -m "Description of your changes"
git push origin main
```

### **On a New Computer**

```powershell
# Clone the repository
git clone https://github.com/YOUR_USERNAME/resto-pos-system.git
cd resto-pos-system

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../shared && npm install

# Setup database (if needed)
cd ../backend
npm run db:setup
npm run db:optimize

# Start development
npm run dev  # Backend
# In another terminal:
cd frontend && npm start  # Frontend
```

---

## 📋 **Common Git Commands**

### **Daily Workflow**
```powershell
# Check status
git status

# See what files changed
git diff

# Add specific files
git add filename.tsx

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

### **Branch Management**
```powershell
# Create new branch
git checkout -b feature/new-feature

# Switch to main branch
git checkout main

# See all branches
git branch

# Delete branch
git branch -d feature-name
```

### **Undo Changes**
```powershell
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo changes to specific file
git checkout -- filename.tsx
```

---

## 🔧 **Troubleshooting**

### **If Git is not recognized:**
1. Make sure Git is installed
2. Restart your terminal/PowerShell
3. Try: `where git` to see if Git is in PATH

### **If push fails:**
```powershell
# Pull latest changes first
git pull origin main

# Then push
git push origin main
```

### **If you get authentication errors:**
1. Use GitHub CLI: `gh auth login`
2. Or use Personal Access Token
3. Or use SSH keys

### **If you want to ignore files:**
- Edit `.gitignore` file
- Add file patterns you don't want to track
- Commit the changes: `git add .gitignore && git commit -m "Update gitignore"`

---

## 📱 **GitHub Desktop Alternative**

If you prefer a GUI:
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. Clone your repository
4. Use the visual interface for commits and pushes

---

## 🎯 **Best Practices**

1. **Commit frequently** - Small, logical commits are better than large ones
2. **Write clear commit messages** - Describe what you changed and why
3. **Pull before pushing** - Always sync with remote changes first
4. **Use branches for features** - Keep main branch stable
5. **Review before pushing** - Make sure your changes work correctly

---

## 🆘 **Need Help?**

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

**Happy coding! 🚀** 