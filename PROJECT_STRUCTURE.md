# PUHC Innovation Alleys - Project Structure

## Overview
This document describes the current project structure, file organization, and deployment workflow for the PUHC Innovation Alleys website.

---

## Directory Structure

```
PUHC (ALLEY BLOOM)/
├── app.py                          # Flask application (development server)
├── build_static.py                 # Static site generator for GitHub Pages
├── requirements.txt                # Python dependencies
├── runtime.txt                     # Python version for deployment
├── Procfile                        # Heroku deployment config
├── wsgi.py                         # WSGI entry point
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
│
├── templates/                      # Flask HTML templates (source)
│   ├── index_unified.html          # Home page (Alley 3 overview)
│   ├── existing_new.html           # Before/existing conditions
│   ├── compare.html                # Before/after comparison
│   ├── urban_farming.html          # Urban Farming intervention
│   ├── solar_shades.html           # Solar Shades intervention
│   ├── murals.html                 # Community Murals intervention
│   ├── unreal_viewer.html          # Digital Twin 3D viewer
│   ├── innovation_alleys_map.html  # 12 Alleys interactive map
│   ├── puhc_puede.html             # PUHC PUEDE case study
│   └── includes/                   # Shared template partials
│
├── static/                         # Static assets (source)
│   ├── css/
│   │   ├── global-theme.css        # Global design system
│   │   └── fence-map-improvements.css
│   ├── js/
│   │   └── cache-buster.js
│   ├── images/
│   │   ├── medallions/             # Fence medallion designs
│   │   └── [building elevations]
│   ├── documents/
│   │   └── AURA_REPORT.pdf
│   └── videos/
│
├── interactive-fence-map.html      # Standalone fence customization tool
├── rhino-viewer.html               # Standalone 3DM file viewer
│
├── content/                        # Dynamic content (JSON)
│   └── cost_data.json
│
├── data/                           # Application data
│   └── scenarios.json
│
├── docs/                           # Generated static site (GitHub Pages output)
│   ├── index.html
│   ├── fence-map.html              # Renamed from interactive-fence-map
│   ├── [other generated pages]
│   ├── static/                     # Copied from source
│   └── content/                    # Copied from source
│
├── models.py                       # Database models
├── data_manager.py                 # Data persistence layer
├── content_manager.py              # Content management
│
└── Documentation/
    ├── README.md
    ├── PROJECT_STRUCTURE.md        # This file
    ├── UX_UI_REDESIGN_SUMMARY.md
    ├── PRODUCTION_AUDIT_REPORT.md
    └── PRODUCTION_READY_FINAL_REPORT.md
```

---

## Page Routes & Files

### Current Routes (Flask Development)

| Route | Template | Static Output | Description |
|-------|----------|---------------|-------------|
| `/` | `index_unified.html` | `index.html` | Home - Alley 3 overview |
| `/existing` | `existing_new.html` | `existing.html` | Before/existing conditions |
| `/compare` | `compare.html` | `compare.html` | Before/after comparison |
| `/urban-farming` | `urban_farming.html` | `urban-farming.html` | Urban Farming intervention |
| `/solar-shades` | `solar_shades.html` | `solar-shades.html` | Solar Shades intervention |
| `/murals` | `murals.html` | `murals.html` | Community Murals |
| `/unreal-viewer` | `unreal_viewer.html` | `unreal-viewer.html` | Digital Twin 3D viewer |
| `/innovation-alleys-map` | `innovation_alleys_map.html` | `innovation-alleys-map.html` | 12 Alleys map |
| `/puhc-puede` | `puhc_puede.html` | `puhc-puede.html` | PUHC PUEDE case study |
| `/fence-map` | Redirect → `/interactive-fence-map` | - | Alias |
| `/interactive-fence-map` | `interactive-fence-map.html` (standalone) | `fence-map.html` | Fence customization tool |
| `/rhino-viewer` | `rhino-viewer.html` (standalone) | `rhino-viewer.html` | 3DM file viewer |

### Redirects
- `/fence-map` → `/interactive-fence-map` (development)
- `/digital-twin` → `/unreal-viewer` (legacy compatibility)
- `/trellises` → `/solar-shades` (trellises are part of shade structures)

---

## Static Site Generation

### Build Process

**Command:**
```bash
python build_static.py
```

**What it does:**
1. Clears `docs/` folder (preserves `static/` and `content/` subdirs)
2. Copies `static/` → `docs/static/`
3. Copies `content/` → `docs/content/`
4. Generates HTML from Flask templates
5. Fixes asset paths for static deployment (removes leading `/`)
6. Fixes navigation links (adds `.html` extensions)
7. Copies standalone HTML files
8. Renames `interactive-fence-map.html` → `fence-map.html` for cleaner URLs

**Output:** `docs/` folder ready for GitHub Pages deployment

---

## GitHub Pages Deployment

### Configuration
- **Branch:** `main` (or dedicated `gh-pages` branch)
- **Folder:** `/docs`
- **URL:** `https://[username].github.io/[repo-name]/`

### Static Compatibility

**Fully Static (No Flask Required):**
- All page templates
- Fence map (interactive-fence-map.html)
- Rhino viewer
- Navigation
- CSS/JS interactions
- Image galleries

**Limited on GitHub Pages (API-dependent features):**
- Live weather data (NASA, OpenWeatherMap)
- Real-time species observations (iNaturalist)
- Google Cloud API integrations
- Scenario saving/loading (requires backend)

**Workarounds for Static Deployment:**
- Pre-generate data as static JSON
- Use client-side API calls with CORS-enabled endpoints
- Provide demo/cached data for offline functionality

---

## Key Technologies

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **JavaScript (Vanilla)** - No framework dependencies
- **SVG** - Interactive graphics and overlays

### Backend (Development)
- **Flask** - Python web framework
- **Jinja2** - Template engine
- **Python 3.11** - Runtime

### Deployment
- **GitHub Pages** - Static hosting
- **Heroku** (optional) - Dynamic Flask hosting
- **Netlify** (alternative) - Static + serverless functions

---

## Development Workflow

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run Flask development server
python app.py

# Access at http://localhost:5000
```

### Build Static Site
```bash
# Generate static files
python build_static.py

# Test static site locally
cd docs
python -m http.server 8000

# Access at http://localhost:8000
```

### Deploy to GitHub Pages
```bash
# Build static site
python build_static.py

# Commit and push
git add docs/
git commit -m "Update static site"
git push origin main
```

---

## File Naming Conventions

### Templates
- Use underscores: `index_unified.html`, `existing_new.html`
- Descriptive names matching route purpose

### Routes
- Use hyphens: `/urban-farming`, `/solar-shades`
- Lowercase, URL-friendly

### Static Output
- Use hyphens: `urban-farming.html`, `solar-shades.html`
- Match route names for consistency

### CSS/JS
- Use hyphens: `global-theme.css`, `fence-map-improvements.css`
- Descriptive, component-based names

---

## Important Notes

### Standalone HTML Files
- `interactive-fence-map.html` and `rhino-viewer.html` are standalone (not templates)
- They exist in root directory for development convenience
- Copied to `docs/` during build process
- `interactive-fence-map.html` renamed to `fence-map.html` in static output

### Route Mismatches (Resolved)
- Development: `/fence-map` redirects to `/interactive-fence-map`
- Static: Both resolve to `fence-map.html`
- Navigation updated to use consistent naming

### Asset Paths
- Development: Absolute paths (`/static/css/...`)
- Static: Relative paths (`static/css/...`)
- Build script handles conversion automatically

---

## Maintenance

### Adding New Pages
1. Create template in `templates/`
2. Add route in `app.py`
3. Add to `build_static.py` routes list
4. Update navigation in templates
5. Rebuild static site

### Updating Styles
1. Edit `static/css/global-theme.css` or page-specific CSS
2. Test in development (`python app.py`)
3. Rebuild static site (`python build_static.py`)
4. Deploy to GitHub Pages

### Managing Content
- Edit JSON files in `content/` folder
- Content is copied to static build automatically
- Client-side JS loads content dynamically

---

## Contact & Documentation

For questions or issues, refer to:
- `README.md` - Project overview and quick start
- `UX_UI_REDESIGN_SUMMARY.md` - Recent design improvements
- `PRODUCTION_AUDIT_REPORT.md` - Production readiness audit

**Last Updated:** April 3, 2026
