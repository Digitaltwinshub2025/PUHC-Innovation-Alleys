# Alley 3 Cleanup Checklist

**Purpose:** Remove draft files, notes, and unused assets to prepare clean handoff package.

---

## Files to KEEP (Production-Ready)

### Core Application Files
- [x] `app.py` - Flask backend
- [x] `requirements.txt` - Python dependencies
- [x] `Procfile` - Deployment config
- [x] `runtime.txt` - Python version
- [x] `wsgi.py` - WSGI entry point
- [x] `gunicorn_config.py` - Gunicorn settings
- [x] `.env.example` - Environment variables template
- [x] `.gitignore` - Git ignore rules
- [x] `README.md` - Project documentation

### HTML Templates (14 Production Pages)
- [x] `templates/index_unified.html` - Home page
- [x] `templates/solar_shades.html` - Shade Structures intervention
- [x] `templates/murals.html` - Community Murals intervention
- [x] `templates/urban_farming.html` - Urban Farming intervention
- [x] `templates/unreal_viewer.html` - Digital Twin 3D viewer
- [x] `templates/compare.html` - Before/After comparison
- [x] `templates/visualization_studio.html` - Street View explorer
- [x] `templates/before_after.html` - Scenario comparison
- [x] `templates/design_workspace.html` - Co-design studio
- [x] `templates/scenarios.html` - Scenario management
- [x] `templates/live_dashboard.html` - Environmental tracking
- [x] `templates/plant_library.html` - Plant database
- [x] `templates/innovation_alleys_map.html` - Interactive map
- [x] `templates/existing.html` - Current conditions viewer

### Static Assets
- [x] `static/css/global-theme.css` - Unified design system
- [x] `static/js/` - All JavaScript files
- [x] `static/images/` - All approved images

### Documentation
- [x] `docs/COLLEAGUE_QUICK_START.md`
- [x] `docs/GITHUB_DEPLOYMENT.md`
- [x] `docs/SETUP.md`
- [x] `docs/INTEGRATION_GUIDE.md`
- [x] `docs/PACKAGE_CONTENTS.md`
- [x] `docs/DEPLOYMENT_CHECKLIST.md`
- [x] All other docs in `docs/` folder

### New Handoff Documents
- [x] `ALLEY3_HANDOFF_PACKAGE.md` - Main handoff document
- [x] `CLEANUP_CHECKLIST.md` - This file

---

## Files to REMOVE (Development/Draft Only)

### Development Scripts
- [ ] `rename_murals.ps1` - Temporary renaming script
- [ ] `check_unreal_connection.ps1` - Development testing
- [ ] `test_all_fixes.py` - Development testing
- [ ] `save_image.py` - Development utility
- [ ] `start_dev.ps1` - Development launcher (keep for local dev)
- [ ] `start_dev_server.bat` - Development launcher (keep for local dev)
- [ ] `SIMPLE_START.ps1` - Development launcher (keep for local dev)
- [ ] `START_HERE.bat` - Development launcher (keep for local dev)

### Draft/Unused Templates
- [ ] `templates/design_brief.html` - Internal planning document
- [ ] `templates/design_library.html` - Component library (not user-facing)
- [ ] `templates/trellises.html` - Redirects to solar_shades.html (can keep for redirect)

### Temporary/Cache Files
- [ ] `__pycache__/` - Python cache (auto-generated)
- [ ] `instance/` - Flask instance folder (if empty)

### Desktop Source Images (Already Copied)
- [ ] `c:\Users\MLee7\Desktop\Alley 3 Community Murals\` - Source images (already copied to static/images)
- [ ] `c:\Users\MLee7\Desktop\Alley 3 Urban Farming\` - Source images (already copied to static/images)

---

## Files to KEEP (For Local Development)

These files are useful for developers setting up locally but not needed for production deployment:

- [x] `start_dev.ps1` - Quick local development start
- [x] `start_dev_server.bat` - Alternative dev launcher
- [x] `SIMPLE_START.ps1` - Simplified dev launcher
- [x] `START_HERE.bat` - Windows quick start
- [x] `start_server.ps1` - Server start script
- [x] `start_server.sh` - Unix server start script
- [x] `deploy_to_github.bat` - GitHub deployment helper
- [x] `launch_unreal_pixel_streaming.bat` - Unreal Engine launcher
- [x] `start_pixel_streaming.bat` - Pixel streaming launcher
- [x] `server.js` - Node.js server (if used)

---

## Recommended Actions

### 1. Remove Development-Only Scripts
```powershell
Remove-Item "rename_murals.ps1"
Remove-Item "check_unreal_connection.ps1"
Remove-Item "test_all_fixes.py"
Remove-Item "save_image.py"
```

### 2. Keep Draft Templates for Reference (Optional)
- `design_brief.html` - Contains project planning context
- `design_library.html` - Component reference
- `trellises.html` - Maintains redirect functionality

**Recommendation:** Keep these files but move to a `_archive/` folder.

### 3. Clean Python Cache
```powershell
Remove-Item -Recurse -Force "__pycache__"
```

### 4. Verify All Production Images
Ensure all images referenced in HTML templates exist in `static/images/`:
- [x] Street View photos (alley-street-*.jpg/png)
- [x] Digital twin renders (intervention-*.png)
- [x] Garden transformation (garden-transformation-alley3.png)
- [x] Mural images (underwater-mural-alley.png, water-mural.png)
- [x] Medallion icons (jellyfish.png, turtle.png, etc.)

---

## Final Package Structure

```
PUHC (ALLEY BLOOM)/
├── ALLEY3_HANDOFF_PACKAGE.md    # Main handoff document
├── README.md                     # Setup instructions
├── requirements.txt              # Dependencies
├── Procfile                      # Deployment config
├── app.py                        # Flask backend
├── templates/                    # 14 production HTML files
├── static/
│   ├── css/global-theme.css
│   ├── js/
│   └── images/
├── docs/                         # Integration guides
└── [development scripts]         # Optional, for local setup
```

---

## Status

- [x] Handoff package documented
- [x] Production files identified
- [ ] Development scripts removed (optional)
- [ ] Draft templates archived (optional)
- [ ] Python cache cleaned
- [ ] Final package tested

---

**Next Step:** Review this checklist with the user to confirm which files to remove vs. keep for local development support.
