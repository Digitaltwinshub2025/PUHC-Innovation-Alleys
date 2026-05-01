# GitHub Push Guide - PUHC Innovation Alleys

## Current Status

- **Total Project Size**: 983.8 MB (with videos and docs)
- **Git Repository Size**: 224.58 MB (videos and docs excluded)
- **Status**: Ready to push to GitHub

## What's Excluded

The `.gitignore` file excludes:
- All video files (`static/videos/*.mp4`) - 242 MB
- `docs/` folder (static build output) - 250 MB
- Database files
- Python cache
- Environment variables

## Quick Push to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `puhc-innovation-alleys` (or your choice)
3. Description: "Alley 3 - Water Alley: Digital Twin for Environmental Justice"
4. Choose Public or Private
5. Do NOT initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Push Your Code

```bash
# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/puhc-innovation-alleys.git

# Stage all changes
git add .

# Commit
git commit -m "Initial commit: PUHC Innovation Alleys platform"

# Push to GitHub
git push -u origin main
```

If you get an error about branch name, try:
```bash
git branch -M main
git push -u origin main
```

## Alternative: Use GitHub Desktop

1. Open GitHub Desktop
2. File > Add Local Repository
3. Choose this folder
4. Click "Publish repository"
5. Choose name and visibility
6. Click "Publish"

## Deployment Options

### Option 1: GitHub Pages (Static Site)

```bash
# Build static site
python build_static.py

# The docs/ folder is excluded from git by default
# To deploy to GitHub Pages, you need to either:

# A) Remove docs/ from .gitignore temporarily
# B) Use a separate branch for deployment
# C) Use GitHub Actions to build on push
```

**Recommended: Use GitHub Actions**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Build static site
        run: python build_static.py
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

### Option 2: Heroku (Dynamic Flask App)

```bash
# Login to Heroku
heroku login

# Create app
heroku create puhc-innovation-alleys

# Push to Heroku
git push heroku main

# Open app
heroku open
```

### Option 3: Vercel (Recommended for Static)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts
```

## Video Hosting Solution

Since videos are excluded, you have two options:

### Option A: YouTube Embeds (Recommended)

1. Upload videos to YouTube:
   - Puede Center flythrough (224 MB)
   - Medallion Art showcase (12 MB)
   - Alley 3 flythrough (5.5 MB)

2. Update HTML files to use YouTube embeds
3. No storage needed in repository

### Option B: Git LFS (If you need files in repo)

```bash
# Install Git LFS
git lfs install

# Track video files
git lfs track "static/videos/*.mp4"

# Add .gitattributes
git add .gitattributes

# Commit and push
git add static/videos/
git commit -m "Add videos with Git LFS"
git push
```

Note: GitHub free tier includes 1 GB LFS storage

## Repository Size Breakdown

| Category | Size | Included in Git |
|----------|------|-----------------|
| Videos | 242 MB | No (excluded) |
| docs/ folder | 250 MB | No (excluded) |
| Images | 150 MB | Yes |
| Code & Templates | 50 MB | Yes |
| Documentation | 25 MB | Yes |
| **Total in Git** | **~225 MB** | **Yes** |

## Pre-Push Checklist

- [x] .gitignore updated
- [x] Large files excluded
- [x] Repository size under 500 MB
- [ ] Sensitive data removed (.env excluded)
- [ ] README updated
- [ ] License file present
- [ ] Documentation complete

## Common Issues

### Issue: Repository too large
**Solution**: Videos and docs are already excluded. If still too large, compress images to WebP.

### Issue: Push rejected (file too large)
**Solution**: Check if a large file was accidentally committed. Use Git LFS or remove it.

### Issue: Videos not loading after deployment
**Solution**: Use YouTube embeds or set up external hosting.

## Next Steps After Push

1. Enable GitHub Pages in repository settings
2. Set up custom domain (optional)
3. Configure environment variables for deployment
4. Set up CI/CD with GitHub Actions
5. Add collaborators if needed

## Support

For issues:
1. Check `.gitignore` is working: `git status`
2. Verify excluded files: `git ls-files`
3. Check repository size: `git count-objects -vH`

---

**Ready to push!** Repository is optimized for GitHub.

**Last Updated:** May 1, 2026
