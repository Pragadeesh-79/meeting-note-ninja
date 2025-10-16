#!/bin/bash

echo "🚀 Meeting Note Ninja Deployment Script"
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Please follow these steps to complete deployment:${NC}"
echo ""

echo -e "${YELLOW}Step 1: Create GitHub Repository${NC}"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: meeting-note-ninja"
echo "3. Description: AI-powered meeting notes parser with intelligent text analysis"
echo "4. Make it Public ✅"
echo "5. Don't initialize with README (we already have one)"
echo "6. Click 'Create repository'"
echo ""

echo -e "${YELLOW}Step 2: Push to GitHub${NC}"
echo "After creating the repository, GitHub will show you commands like:"
echo ""
echo "git remote add origin https://github.com/YOUR_USERNAME/meeting-note-ninja.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""

echo -e "${YELLOW}Step 3: Deploy to Vercel${NC}"
echo "1. Go to: https://vercel.com/new"
echo "2. Import from GitHub: meeting-note-ninja"
echo "3. Framework Preset: Other"
echo "4. Root Directory: ./"
echo "5. Build Command: npm run vercel-build"
echo "6. Output Directory: client"
echo "7. Install Command: npm install"
echo "8. Click Deploy ⚡"
echo ""

echo -e "${GREEN}✨ Your app will be live at: https://meeting-note-ninja.vercel.app${NC}"
echo ""

echo -e "${BLUE}🔧 Local Development:${NC}"
echo "To run locally:"
echo "cd server && npm install && npm start"
echo "Open: http://localhost:3001"
echo ""

echo -e "${GREEN}🎉 Repository is ready for deployment!${NC}"
echo "Current git status:"
git log --oneline -1
echo ""
echo "Files ready for push:"
git ls-files | head -10
echo "... and more"
