# Enable GitHub Pages - Quick Guide

## The Problem
You're getting 404 errors because GitHub Pages is not enabled yet for your repository.

## The Solution (2 minutes)

### Step 1: Go to Repository Settings
1. Open https://github.com/Digitaltwinshub2025/PUHC-Innovation-Alleys
2. Click **Settings** tab (top right)

### Step 2: Navigate to Pages
1. In the left sidebar, scroll down to **Pages** (under "Code and automation")
2. Click **Pages**

### Step 3: Configure Source
1. Under "Build and deployment"
2. Under "Source", select **Deploy from a branch**
3. Under "Branch":
   - Select **main** from the dropdown
   - Select **/docs** from the folder dropdown
   - Click **Save**

### Step 4: Wait for Deployment
1. GitHub will show "Your site is ready to be published"
2. Wait 1-2 minutes for the build to complete
3. Refresh the page - you'll see "Your site is live at..."

### Step 5: Access Your Site
Your site will be available at:
```
https://digitaltwinshub2025.github.io/PUHC-Innovation-Alleys/
```

## Verify Pages Work

Once enabled, test these URLs:
- Homepage: https://digitaltwinshub2025.github.io/PUHC-Innovation-Alleys/
- Solar Shades: https://digitaltwinshub2025.github.io/PUHC-Innovation-Alleys/solar-shades.html
- Murals: https://digitaltwinshub2025.github.io/PUHC-Innovation-Alleys/murals.html
- Urban Farming: https://digitaltwinshub2025.github.io/PUHC-Innovation-Alleys/urban-farming.html

## Troubleshooting

### Still getting 404?
1. Make sure you selected **/docs** folder (not root)
2. Wait 2-3 minutes after saving settings
3. Try hard refresh (Ctrl+Shift+R)
4. Check that the branch is **main** (not master)

### Pages not showing in Settings?
1. Make sure the repository is public
2. Check that docs/ folder exists in the repository
3. Verify you have admin access to the repository

## Current Status

Your repository has:
- docs/index.html (homepage)
- docs/solar-shades.html (intervention 1)
- docs/murals.html (intervention 2)
- docs/urban-farming.html (intervention 3)
- docs/compare.html (before/after)
- docs/existing.html (existing conditions)
- docs/fence-map.html (fence customization)
- docs/unreal-viewer.html (digital twin)
- docs/puhc-puede.html (case study)
- docs/aura-report.html (research)
- docs/static/ (all assets)

All files are ready - you just need to enable GitHub Pages!

---

**Time to enable:** 2 minutes  
**Time to go live:** 1-2 minutes after enabling  
**Total:** ~3-4 minutes
