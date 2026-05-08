# New Images Replacement Guide
**Source Folder:** `C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE`  
**Date:** May 6, 2026

---

## OVERVIEW

You have **18 new high-quality cinematic URE renders** that should replace the current images in your build. These new images show:
- Better lighting and atmosphere
- More realistic materials and textures
- Cinematic camera angles
- Mature plants with realistic foliage
- Better integration of all three interventions

---

## REPLACEMENT MAPPING

### 1. URBAN FARMING INTERVENTION IMAGES

#### Main Intervention Images (In-Context)
**Current Files to Replace:**
- `static/images/unreal/photo-2.webp` (planter boxes in alley)

**New Files to Use:**
| New File | Use For | Description |
|----------|---------|-------------|
| `Alley Planter Cinematic image 1.webp` | Primary urban farming hero image | Beautiful shot of two galvanized planters with lush green plants and trellis against fence |
| `Alley Planter Cinematic image 2.webp` | Secondary/alternate view | Different angle of planters in alley context |
| `Alley Planter Cinematic with canopy image 3.webp` | Shows integration with shade structures | Planters + overhead canopy together |
| `Alley Planter cinematyic image 11.webp` | Additional context shot | Another beautiful planter view |
| `Alley planter cinematic image 10.webp` | Gallery/comparison image | Clean planter shot |

**Pages to Update:**
- `urban_farming.html` - Section B (Intervention Description)
- `index_unified.html` - Urban Farming card
- `unreal_viewer.html` - Gallery

---

#### Individual Planter Components (2D Product Shots)
**Current Files to Replace:**
- `static/images/urban-farming-object-1.webp`
- `static/images/urban-farming-object-2.webp`
- `static/images/urban-farming-object-3.webp`
- `static/images/urban-farming-object-4.webp`

**New Files to Use:**
| New File | Replaces | Description |
|----------|----------|-------------|
| `2d Planter 1 image.webp` | `urban-farming-object-1.webp` | Raised bed with trellis grid and climbing plants |
| `2d Planter 2 image 2.webp` | `urban-farming-object-2.webp` | Different planter type with mature plants |
| `2d Planter 3 image 2.webp` | `urban-farming-object-3.webp` | Third planter variation |
| `2d Planter 4 image 4.webp` | `urban-farming-object-4.webp` | Fourth planter type |

**Pages to Update:**
- `urban_farming.html` - Component gallery section

**Benefits of New Images:**
- Transparent backgrounds (perfect for product display)
- More realistic plant rendering
- Better lighting and shadows
- Professional product photography style

---

### 2. SHADE STRUCTURES INTERVENTION IMAGES

#### Main Canopy Images
**Current Files to Replace:**
- `static/images/unreal/photo-3.webp` (overhead canopy frame)

**New Files to Use:**
| New File | Use For | Description |
|----------|---------|-------------|
| `Alley Canopy Cinematic image 5.webp` | Primary shade structures hero | Beautiful shot showing overhead canopy with mural and fence |
| `Alley Canopy Cinematic image 6.webp` | Secondary canopy view | Different angle of canopy system |
| `Alley canopy cinemative image 12.webp` | Additional canopy shot | Another perspective |
| `Alley Planter Cinematic with canopy image 3.webp` | Shows canopy + planters integration | Demonstrates multi-intervention approach |
| `Alley Cinematic canopy mural image 9.webp` | Shows canopy + murals integration | All three interventions together |

**Pages to Update:**
- `solar_shades.html` - Section B (Intervention Description)
- `index_unified.html` - Shade Structures card
- `unreal_viewer.html` - Gallery

**Benefits of New Images:**
- Better shows the actual shade sail design
- More dramatic lighting (shows shade effect)
- Better integration with other interventions
- Cinematic quality

---

### 3. COMMUNITY MURALS INTERVENTION IMAGES

#### Main Mural Images
**Current Files to Replace:**
- `static/images/unreal/photo-5.webp` (water-themed murals)
- `static/images/murals/mural-1.webp`
- `static/images/murals/mural-2.webp`
- `static/images/murals/mural-3.webp`

**New Files to Use:**
| New File | Use For | Description |
|----------|---------|-------------|
| `Alley Mural Cinematic image 7.webp` | Primary murals hero image | Stunning shot of jellyfish mural with planter in foreground |
| `Alley Cinematic canopy mural image 9.webp` | Shows murals + canopy | Integration shot |
| `Alley Medaliion cinematic image 4.webp` | Medallion detail shot | Close-up of water medallions on posts |
| `Alley medlaion images 13.webp` | Additional medallion view | Another medallion perspective |

**Pages to Update:**
- `murals.html` - Section B (Intervention Description)
- `index_unified.html` - Community Murals card
- `unreal_viewer.html` - Gallery

**Benefits of New Images:**
- Better mural detail and color
- Shows murals in full alley context
- Better lighting (more dramatic)
- Shows integration with planters

---

### 4. OVERVIEW/AERIAL IMAGES

#### New Aerial/Wide Shots
**Current Files to Replace:**
- `static/images/unreal/photo-1.webp` (if it's an overview shot)

**New Files to Use:**
| New File | Use For | Description |
|----------|---------|-------------|
| `Alley Arial View Cinematic 8.webp` | Homepage hero or overview section | Aerial/elevated view of entire alley transformation |
| `Alley cinematice image 12.webp` | Additional overview | Another wide shot of alley |

**Pages to Update:**
- `index_unified.html` - Hero section or overview
- `compare.html` - Before/after comparison
- `unreal_viewer.html` - Gallery

---

### 5. DIGITAL TWIN GALLERY IMAGES

#### Complete Gallery Replacement
**Current Files:**
- `static/images/unreal/photo-1.webp` through `photo-6.webp`

**New Recommended Gallery Order:**
1. `Alley Arial View Cinematic 8.webp` - Overview/establishing shot
2. `Alley Planter Cinematic image 1.webp` - Urban farming focus
3. `Alley Canopy Cinematic image 5.webp` - Shade structures focus
4. `Alley Mural Cinematic image 7.webp` - Community murals focus
5. `Alley Planter Cinematic with canopy image 3.webp` - Integration shot 1
6. `Alley Cinematic canopy mural image 9.webp` - Integration shot 2
7. `Alley Medaliion cinematic image 4.webp` - Detail shot (medallions)
8. `Alley planter cinematic image 10.webp` - Detail shot (planters)

**Page to Update:**
- `unreal_viewer.html` - Main gallery

---

## DETAILED REPLACEMENT INSTRUCTIONS

### Step 1: Backup Current Images
```powershell
# Create backup folder
New-Item -Path "static/images/backup_old_images" -ItemType Directory

# Copy current images to backup
Copy-Item "static/images/unreal/*" "static/images/backup_old_images/"
Copy-Item "static/images/urban-farming-object-*.webp" "static/images/backup_old_images/"
Copy-Item "static/images/murals/*" "static/images/backup_old_images/"
```

### Step 2: Copy New Images to Project

#### Urban Farming In-Context Images
```powershell
# Copy to unreal folder with new names
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Planter Cinematic image 1.webp" "static/images/unreal/urban-farming-hero.webp"
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Planter Cinematic image 2.webp" "static/images/unreal/urban-farming-alt.webp"
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Planter Cinematic with canopy image 3.webp" "static/images/unreal/urban-farming-with-canopy.webp"
```

#### Urban Farming Component Images
```powershell
# Replace individual planter components
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\2d Planter 1 image.webp" "static/images/urban-farming-object-1.webp" -Force
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\2d Planter 2 image 2.webp" "static/images/urban-farming-object-2.webp" -Force
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\2d Planter 3 image 2.webp" "static/images/urban-farming-object-3.webp" -Force
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\2d Planter 4 image 4.webp" "static/images/urban-farming-object-4.webp" -Force
```

#### Shade Structures Images
```powershell
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Canopy Cinematic image 5.webp" "static/images/unreal/shade-structures-hero.webp"
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Canopy Cinematic image 6.webp" "static/images/unreal/shade-structures-alt.webp"
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley canopy cinemative image 12.webp" "static/images/unreal/shade-structures-detail.webp"
```

#### Community Murals Images
```powershell
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Mural Cinematic image 7.webp" "static/images/unreal/murals-hero.webp"
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Medaliion cinematic image 4.webp" "static/images/unreal/medallions-detail.webp"
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley medlaion images 13.webp" "static/images/unreal/medallions-alt.webp"
```

#### Overview/Aerial Images
```powershell
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Arial View Cinematic 8.webp" "static/images/unreal/alley-aerial-view.webp"
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley cinematice image 12.webp" "static/images/unreal/alley-overview.webp"
```

#### Integration Shots
```powershell
Copy-Item "C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\Alley Cinematic canopy mural image 9.webp" "static/images/unreal/integration-all.webp"
```

### Step 3: Update HTML Templates

#### urban_farming.html
**Line ~424:** Replace main intervention image
```html
<!-- OLD -->
<img src="/static/images/unreal/photo-2.webp" alt="..." />

<!-- NEW -->
<img src="/static/images/unreal/urban-farming-hero.webp" alt="Alley 3 urban farming with galvanized planters and lush vegetation - Unreal Engine render" />
```

#### solar_shades.html
**Line ~424:** Replace main intervention image
```html
<!-- OLD -->
<img src="/static/images/unreal/photo-3.webp" alt="..." />

<!-- NEW -->
<img src="/static/images/unreal/shade-structures-hero.webp" alt="Alley 3 overhead shade canopy with water-themed mural - Unreal Engine render" />
```

#### murals.html
**Main intervention image:** Replace with new mural shot
```html
<!-- NEW -->
<img src="/static/images/unreal/murals-hero.webp" alt="Water-themed jellyfish mural with urban farming planter - Unreal Engine render" />
```

#### index_unified.html
**Intervention Cards (Lines ~574, ~588, ~602):**
```html
<!-- Shade Structures Card -->
<img src="/static/images/unreal/shade-structures-hero.webp" alt="Shade Structures - Alley 3 canopy system" />

<!-- Community Murals Card -->
<img src="/static/images/unreal/murals-hero.webp" alt="Community Murals - Water-themed murals on alley walls" />

<!-- Urban Farming Card -->
<img src="/static/images/unreal/urban-farming-hero.webp" alt="Urban Farming - Container gardens with planter boxes" />
```

#### unreal_viewer.html
**Gallery Images:** Replace all photo-1 through photo-6 with new cinematic images

### Step 4: Copy to docs/ folder
```powershell
# After updating templates, rebuild static site
python build_static.py

# Or manually copy images to docs
Copy-Item "static/images/unreal/*" "docs/static/images/unreal/" -Force
Copy-Item "static/images/urban-farming-object-*.webp" "docs/static/images/" -Force
```

---

## COMPARISON: OLD vs NEW

### Image Quality Improvements

#### OLD IMAGES (Current):
- Basic URE renders
- Standard lighting
- Less atmospheric
- Simpler materials
- Basic plant rendering

#### NEW IMAGES (Replacement):
- Cinematic quality renders
- Dramatic lighting and shadows
- Atmospheric depth
- Realistic materials (wood, metal, paint)
- Photorealistic plant foliage
- Better camera angles
- Professional composition

### File Sizes
**Old Images:** ~1.0-1.5 MB each  
**New Images:** ~500-750 KB each (better compression, same quality)

---

## RECOMMENDED PRIORITY ORDER

### Phase 1: Critical Replacements (Do First)
1. **Homepage intervention cards** - Most visible
   - Urban Farming card → `urban-farming-hero.webp`
   - Shade Structures card → `shade-structures-hero.webp`
   - Community Murals card → `murals-hero.webp`

2. **Individual intervention pages** - Main hero images
   - `urban_farming.html` → `urban-farming-hero.webp`
   - `solar_shades.html` → `shade-structures-hero.webp`
   - `murals.html` → `murals-hero.webp`

### Phase 2: Component Updates
3. **Urban farming planter components** - Product gallery
   - All 4 planter object images (2D transparent backgrounds)

### Phase 3: Gallery & Details
4. **Digital twin gallery** - Complete gallery refresh
   - Replace all 6 gallery images with new cinematic shots

5. **Detail shots** - Medallions and close-ups
   - Medallion detail images
   - Additional context shots

---

## CAPTION UPDATES

### New Captions for New Images

**Urban Farming Hero:**
"Galvanized steel planters with mature vegetables and trellis systems / community food production in action"

**Shade Structures Hero:**
"Overhead shade canopy with integrated water-themed mural / solar panels and cultural identity"

**Murals Hero:**
"Water-themed jellyfish mural with urban farming integration / marine life and community art"

**Aerial View:**
"Complete alley transformation from above / all three interventions working together"

**Integration Shots:**
"Shade structures, murals, and urban farming create cohesive corridor experience"

---

## BENEFITS OF UPDATING

### Visual Impact
- **More professional** presentation
- **Better storytelling** through cinematic angles
- **Clearer demonstration** of intervention integration
- **More realistic** representation of final design

### Technical Benefits
- **Smaller file sizes** (faster loading)
- **Better compression** (same quality, less bandwidth)
- **Consistent style** across all images
- **Higher resolution** details

### User Experience
- **More engaging** visuals
- **Better understanding** of spatial relationships
- **Clearer differentiation** between interventions
- **More compelling** call-to-action

---

## TESTING CHECKLIST

After replacing images:

- [ ] Homepage loads correctly with new intervention cards
- [ ] All three intervention pages show new hero images
- [ ] Urban farming component gallery displays 4 new planter images
- [ ] Digital twin gallery shows new cinematic renders
- [ ] All images load quickly (check file sizes)
- [ ] Mobile responsive design still works
- [ ] Image captions are updated and accurate
- [ ] Before/after comparisons still function
- [ ] Static site build completes successfully
- [ ] All images copied to docs/ folder

---

## ROLLBACK PLAN

If issues arise:

```powershell
# Restore old images from backup
Copy-Item "static/images/backup_old_images/*" "static/images/unreal/" -Force

# Rebuild static site
python build_static.py
```

---

## SUMMARY

**Total New Images:** 18 files  
**Images to Replace:** 10+ current files  
**Pages to Update:** 5 HTML templates  
**Estimated Time:** 30-45 minutes  
**Impact:** High - Major visual upgrade across entire platform

**Next Steps:**
1. Review this guide
2. Backup current images
3. Copy new images with recommended naming
4. Update HTML templates
5. Rebuild static site
6. Test all pages
7. Deploy to GitHub

---

**Ready to proceed with image replacement!**
