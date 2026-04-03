# PUHC Innovation Alleys

**Alley 3 - Water Alley: A Digital Twin for Environmental Justice**

An interactive web platform showcasing design interventions for Alley 3 in Pico-Union, Los Angeles. Features include before/after comparisons, a 3D Digital Twin, interactive fence customization, and comprehensive case studies demonstrating how urban design can address environmental justice, climate resilience, and community health.

## ✨ Features

### Three Design Interventions
- **Solar Shades & Water Medallions**: Integrated shade structures with decorative fence medallions
- **Community Murals**: Cultural expression and community ownership
- **Urban Farming**: Container gardens for food security and community building

### Interactive Tools
- **Fence Customization Tool**: Drag-and-drop medallion placement with cost estimation
- **3D Digital Twin**: Unreal Engine-powered immersive visualization
- **Before/After Comparison**: Interactive toggles showing transformation impact
- **Innovation Alleys Map**: Interactive map of 12 alleys across Pico-Union

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Static Site Compatible**: Deployable to GitHub Pages
- **Real-time Interactions**: Client-side JavaScript for smooth UX
- **Cost Tracking**: Automatic calculation of repair and fabrication costs

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd "PUHC (ALLEY BLOOM)"
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask development server**:
   ```bash
   python app.py
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## 🎮 How to Use

### Navigation

1. **Home (Alley 3)**: Overview of the Water Alley prototype with three interventions
2. **Before**: Existing conditions and site analysis
3. **Fence Map**: Interactive medallion customization tool
4. **Explore Dropdown**:
   - Digital Twin: 3D Unreal Engine viewer
   - Innovation Alleys Map: 12 alleys interactive map
   - PUHC PUEDE: Comprehensive case study with AURA Engine research
5. **Compare**: Before/after comparison with intervention toggles

### Fence Customization Tool

1. **Select a Project**: Choose from Area A-D segments
2. **Browse Medallions**: Right sidebar shows 30+ water-themed designs
3. **Drag & Drop**: Drag medallions onto the fence elevation
4. **Snap to Anchors**: Medallions automatically align to fence positions
5. **View Modes**:
   - **Full Elevation**: See the entire building context
   - **Fence Detail View**: 2.5x zoom focused on fence placement area
6. **Cost Tracking**: Real-time calculation of repair + fabrication costs
7. **Controls**: Duplicate, remove, reset, or export your design

## 🏗️ Project Structure

```
PUHC (ALLEY BLOOM)/
├── app.py                          # Flask application
├── build_static.py                 # Static site generator
├── requirements.txt                # Python dependencies
├── templates/                      # Flask templates
│   ├── index_unified.html          # Home page
│   ├── existing_new.html           # Before/existing conditions
│   ├── compare.html                # Before/after comparison
│   ├── urban_farming.html          # Urban Farming intervention
│   ├── solar_shades.html           # Solar Shades intervention
│   ├── murals.html                 # Community Murals
│   ├── unreal_viewer.html          # Digital Twin 3D viewer
│   ├── innovation_alleys_map.html  # 12 Alleys map
│   └── puhc_puede.html             # PUHC PUEDE case study
├── static/                         # Static assets
│   ├── css/
│   │   ├── global-theme.css        # Global design system
│   │   └── fence-map-improvements.css
│   ├── images/
│   │   └── medallions/             # 30+ medallion designs
│   └── documents/
│       └── AURA_REPORT.pdf
├── interactive-fence-map.html      # Standalone fence tool
├── docs/                           # Generated static site
└── PROJECT_STRUCTURE.md            # Detailed structure docs
```

See `PROJECT_STRUCTURE.md` for complete documentation.

## 🔧 Technical Details

### Backend (Development)

- **Framework**: Flask 3.0.0
- **Template Engine**: Jinja2
- **Python**: 3.11
- **Data Storage**: JSON files for scenarios and content

### Frontend

- **Vanilla JavaScript**: No framework dependencies
- **HTML5 Drag & Drop**: Native drag-and-drop for fence customization
- **CSS Custom Properties**: Modern design system with CSS variables
- **SVG Graphics**: Interactive overlays and fence guides
- **Responsive**: Mobile-first design with breakpoints

### Design System

- **Typography**: Inter (body) + Space Grotesk (headings)
- **Colors**: Dark blue gradient with cyan accents
- **Spacing**: 8-level scale (xs to section)
- **Shadows**: 6-level depth system with glow effects
- **Border Radius**: Modern scale (6px to 24px)

See `UX_UI_REDESIGN_SUMMARY.md` for complete design documentation.

## 🌐 Deployment

### GitHub Pages (Static Site)

**Build the static site:**
```bash
python build_static.py
```

This generates a `docs/` folder with:
- All HTML pages with `.html` extensions
- Static assets (CSS, JS, images)
- Relative paths for GitHub Pages compatibility

**Deploy to GitHub Pages:**
1. Commit the `docs/` folder:
   ```bash
   git add docs/
   git commit -m "Update static site"
   git push origin main
   ```

2. Enable GitHub Pages in repository settings:
   - Source: `main` branch
   - Folder: `/docs`

3. Access at: `https://[username].github.io/[repo-name]/`

### Heroku (Dynamic Flask)

**Deploy with Heroku CLI:**
```bash
heroku create puhc-innovation-alleys
git push heroku main
heroku open
```

The `Procfile`, `runtime.txt`, and `requirements.txt` are already configured.

### Local Development

```bash
# Run Flask development server
python app.py

# Access at http://localhost:5000
```

## 🎨 Customization

### Adding New Pages

1. Create template in `templates/`
2. Add route in `app.py`:
   ```python
   @app.route('/your-page')
   def your_page():
       return render_template('your_page.html')
   ```
3. Add to `build_static.py` routes list
4. Update navigation in templates
5. Rebuild static site

### Modifying Styles

**Global styles:**
- Edit `static/css/global-theme.css`
- Uses CSS custom properties (variables)
- Changes apply site-wide

**Page-specific styles:**
- Add `<style>` block in template
- Or create new CSS file in `static/css/`

### Adding Medallions

1. Add image to `static/images/medallions/`
2. Update medallion data in `interactive-fence-map.html`:
   ```javascript
   { id:"m31", name:"New Design", cost:250, defaultScale:1, img:"static/images/medallions/new.webp" }
   ```

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 is occupied, change it in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=8080)
```

### Static Site Build Fails

- Ensure Flask app runs without errors first
- Check that all routes in `build_static.py` exist in `app.py`
- Verify templates render correctly

### Fence Map Drag-Drop Issues

- Clear browser cache
- Check browser console for JavaScript errors
- Ensure images in `static/images/medallions/` are accessible
- Try toggling between Full Elevation and Fence Detail View

### GitHub Pages 404 Errors

- Verify `docs/` folder is committed and pushed
- Check GitHub Pages settings (branch and folder)
- Ensure navigation links use `.html` extensions
- Wait 1-2 minutes for GitHub Pages to rebuild

## 📝 Recent Improvements

### Fence Map Enhancements (April 2026)
- **Fence Detail View**: 2.5x zoom focused on placement area
- **Improved Drag-Drop**: Fixed coordinate transform bugs
- **Medallion Scaling**: Dynamic sizing (52px → 73px in detail view)
- **Visual Feedback**: Fence region highlight in detail mode
- **Ghost Preview**: Adaptive sizing based on view mode

### UX/UI Redesign (April 2026)
- **Typography**: Upgraded to Inter + Space Grotesk
- **Navigation**: Enhanced dropdown with glassmorphism
- **Spacing**: Refined 8-level scale for better hierarchy
- **Shadows**: Premium depth system with glow effects
- **Mobile**: Improved responsive breakpoints and touch targets

See `UX_UI_REDESIGN_SUMMARY.md` for complete details.

## 📝 Future Enhancements

- [ ] Higher resolution building elevations
- [ ] Export fence designs as PDF/image
- [ ] Cost estimation export
- [ ] Additional alley segments (Areas B, C, D)
- [ ] Community feedback integration
- [ ] AR preview for on-site visualization

## 📚 Documentation

- **`README.md`** - This file (overview and quick start)
- **`PROJECT_STRUCTURE.md`** - Detailed project structure and file organization
- **`UX_UI_REDESIGN_SUMMARY.md`** - Recent design improvements documentation
- **`PRODUCTION_AUDIT_REPORT.md`** - Production readiness audit
- **`PRODUCTION_READY_FINAL_REPORT.md`** - Final production report

## � Acknowledgments

### Research Partners
- **AURA Engine** - Environmental justice research and analysis
- **PUHC (Pico-Union Housing Corporation)** - Community partnership

### Project Context
This project demonstrates how digital tools can support community-driven urban design for environmental justice, climate resilience, and public health in underserved Los Angeles neighborhoods.

**Alley 3 - Water Alley** is the primary prototype showcasing integrated interventions:
- Stormwater management through bioswales and rain gardens
- Solar shade structures with decorative water medallions
- Community murals for cultural expression
- Urban farming for food security

### Technology Stack
- Flask (Python web framework)
- Vanilla JavaScript (no framework dependencies)
- CSS Custom Properties (modern design system)
- Unreal Engine (Digital Twin visualization)

---

**PUHC Innovation Alleys**  
*Transforming Pico-Union through community-driven design*

**Last Updated:** April 3, 2026
