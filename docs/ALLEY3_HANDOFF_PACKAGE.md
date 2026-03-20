# Alley 3 - Water Alley Handoff Package

**Project:** PUHC Innovation Alleys - Alley 3 Digital Twin  
**Date:** January 30, 2026  
**Status:** Ready for Integration into Main Website

**Note:** This project is officially named **PUHC Innovation Alleys**, not "Alley Bloom".

---

## Overview

This package contains the final, production-ready content for **Alley 3 (Water Alley)**, the primary prototype for the PUHC Innovation Alleys project. All content has been refined, tested, and approved for integration into the main PUHC website.

---

## Core Pages (9 Production-Ready Files)

### Primary Navigation
1. **index_unified.html** - Home page for Alley 3
2. **unreal_viewer.html** - 3D Digital Twin viewer (Unreal Engine Pixel Streaming)
3. **compare.html** - Before/After comparison tool

### Intervention Cards (3 Interventions)
4. **solar_shades.html** - Shade Structures intervention (sections A-F)
5. **murals.html** - Community Murals intervention (sections A-E)
6. **urban_farming.html** - Urban Farming intervention (sections A-E)

### Supporting Pages
7. **visualization_studio.html** - Street View explorer
8. **before_after.html** - Scenario comparison
9. **design_workspace.html** - Co-design studio

### Additional Tools
10. **scenarios.html** - Scenario management
11. **live_dashboard.html** - Environmental tracking
12. **plant_library.html** - Plant database
13. **innovation_alleys_map.html** - Interactive map
14. **existing.html** - Current conditions viewer

---

## Three Interventions (Final Approved)

### 1. Shade Structures
- **Route:** `/solar-shades`
- **Components:** Overhead solar canopy, vertical trellises, water medallions
- **Sections:** A-F (Existing Conditions → Visual Identity Elements)
- **Images:** Real alley photos + digital twin renders + concept references

### 2. Community Murals
- **Route:** `/murals`
- **Focus:** Water-themed murals on alley walls
- **Sections:** A-E (Existing Conditions → Prototype Impact)
- **Images:** Street View before + underwater mural on real wall + concept reference

### 3. Urban Farming
- **Route:** `/urban-farming`
- **Focus:** Container gardens for food security
- **Sections:** A-E (Existing Conditions → Prototype Impact)
- **Images:** Street View before + garden transformation + digital twin renders

---

## File Structure

```
PUHC (ALLEY BLOOM)/
├── templates/               # HTML pages (14 files)
├── static/
│   ├── css/
│   │   └── global-theme.css  # Unified design system
│   ├── js/
│   │   ├── cache-buster.js
│   │   └── [other scripts]
│   └── images/
│       ├── alley-street-*.jpg/png  # Street View photos
│       ├── intervention-*.png      # Digital twin renders
│       ├── garden-transformation-alley3.png
│       ├── murals/
│       │   ├── underwater-mural-alley.png
│       │   └── water-mural.png
│       ├── medallions/             # Water-themed icons
│       └── artwork/                # Mural photos
├── app.py                   # Flask backend
├── requirements.txt         # Python dependencies
├── Procfile                 # Deployment config
└── docs/                    # Integration guides
```

---

## Design System (Applied to All Cards)

### Consistent Section Structure
- **Hero Header** - System name + description
- **A. Existing Conditions** - Real site photo (80% width, 350px height)
- **B. Intervention Description** - Applied intervention (80% width, 380px height)
  - Optional: Concept Reference (55% width, clearly labeled)
- **C. Role in Alley 3** - Bullet points or brief explanation
- **D. Digital Twin Behavior** - Before/after (220px height) + framing sentence
- **E. Prototype Impact** - Metrics or qualitative impacts

### Image Hierarchy Rules
- Real alley photos ALWAYS prioritized over conceptual imagery
- Primary images: 75-80% page width, centered
- Secondary images: 50-60% page width, centered
- Studio-style captions: "What it is / why it matters"

### Visual Consistency
- Dark gradient background
- Accent color: `var(--accent)` for section letters (A, B, C, D, E)
- Typography: `var(--font-primary)`
- Spacing: Tightened vertical gaps between sections

---

## Routes and URLs

### Main Pages
- `/` - Home (Alley 3 overview)
- `/solar-shades` - Shade Structures intervention
- `/murals` - Community Murals intervention
- `/urban-farming` - Urban Farming intervention
- `/unreal-viewer` - 3D Digital Twin viewer
- `/compare` - Before/After comparison

### Supporting Pages
- `/visualization-studio` - Street View explorer
- `/before-after` - Scenario comparison
- `/design-workspace` - Co-design studio
- `/scenarios` - Scenario management
- `/live-dashboard` - Environmental tracking
- `/plant-library` - Plant database
- `/innovation-alleys-map` - Interactive map
- `/existing` - Current conditions

### Redirects
- `/trellises` → `/solar-shades` (trellises are part of shade system)

---

## Key Assets

### Images (Final Approved)
- `alley-street-1.jpg` - Street View photo 1
- `alley-street-2.png` - Street View photo 2 (Urban Farming before)
- `alley-street-5.jpg` - Street View photo 5 (Murals before, graffiti wall)
- `existing-alley.jpg` - Existing conditions (Shade before)
- `intervention-trellises.png` - Shade system digital twin render
- `intervention-murals.png` - Murals digital twin render
- `intervention-overview.png` - Urban Farming digital twin render
- `garden-transformation-alley3.png` - Garden concept on real alley
- `underwater-mural-alley.png` - Mural on real Alley 3 wall
- `water-mural.png` - Idealized mural concept
- `solar-canopy-system.png` - Shade system concept

### Medallions (Water Theme)
- `jellyfish.png`
- `turtle.png`
- `dolphin.png`
- `octopus.png`
- `seahorse.png`
- `starfish.png`

---

## Integration Instructions

### Option 1: Standalone Deployment
Deploy as a separate Flask application and link from main PUHC site.

### Option 2: Static Export
Export HTML/CSS/JS and integrate into existing CMS or static site.

### Option 3: API Integration
Use Flask backend as API for dynamic content.

### Option 4: IFrame Embed
Embed specific pages (e.g., Digital Twin viewer) into main site.

**See:** `docs/INTEGRATION_GUIDE.md` for detailed instructions.

---

## Dependencies

### Python (Flask Backend)
```
Flask==2.3.2
Flask-SocketIO==5.3.4
python-socketio==5.9.0
gunicorn==21.2.0
```

### External APIs (Optional)
- Google Cloud Vision API
- NASA POWER API
- iNaturalist API
- OpenWeatherMap API

---

## Removed from Handoff Package

### Draft Files
- `design_brief.html` (internal planning document)
- `design_library.html` (component library, not user-facing)
- `trellises.html` (redirects to solar_shades.html)

### Development Scripts
- `rename_murals.ps1`
- `check_unreal_connection.ps1`
- `test_all_fixes.py`
- `save_image.py`

### Notes and Documentation (Keep for Reference)
- `docs/` folder contains deployment guides
- `README.md` contains setup instructions
- `.env.example` contains environment variable template

---

## Testing Checklist

- [x] All intervention cards follow A-E structure
- [x] Image hierarchy: real photos prioritized over concepts
- [x] Section headers use accent-colored letters
- [x] Studio-style captions on all images
- [x] Before/after comparisons at 220px height
- [x] Primary images at 80% width
- [x] Vertical spacing tightened
- [x] Typography consistent across all pages
- [x] Navigation links functional
- [x] Mobile responsive design
- [x] Digital Twin viewer integration

---

## Next Steps for Developer

1. **Review** this handoff document
2. **Test** all 14 pages locally using `python app.py`
3. **Choose** integration method (standalone, static export, API, or iframe)
4. **Follow** integration guide in `docs/INTEGRATION_GUIDE.md`
5. **Deploy** to production environment
6. **Verify** all routes and assets load correctly
7. **Update** main PUHC site navigation to link to Alley 3 content

---

## Contact and Support

For questions about this handoff package, refer to:
- `docs/COLLEAGUE_QUICK_START.md` - 5-30 minute setup guide
- `docs/GITHUB_DEPLOYMENT.md` - Deployment instructions
- `docs/SETUP.md` - Local development setup
- `docs/INTEGRATION_GUIDE.md` - Main website integration

---

**Package Status:** ✅ Ready for Production Integration  
**Last Updated:** January 30, 2026  
**Version:** 1.0 - Final Approved Content
