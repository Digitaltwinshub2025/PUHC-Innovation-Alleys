# Fence Map UX Upgrade Plan
## Combining React Compare Component with Fence Map

---

## Goal

Integrate the polished UX/UI from the React Compare component into the Fence Map page, creating a professional fence inspection and comparison tool.

---

## Key Features to Integrate

### 1. Comparison Slider (from React code)
- **Before/After slider** with draggable handle
- **Smooth drag interaction** (mouse + touch)
- **Visual labels** for before/after states
- **Instruction overlay** ("← Drag to compare →")
- **Clipping mask** for reveal effect

### 2. Scenario Selection (adapted for fences)
- **Three modes:**
  - Existing Condition (deteriorated fence)
  - Repair Only (structural repair)
  - Full Intervention (repair + medallions)
- **Scenario buttons** with color coding
- **Description text** for each scenario

### 3. Metrics Display (fence-specific)
- **Cost breakdown:**
  - Repair estimate
  - Fabrication cost
  - Total cost
- **Condition metrics:**
  - Structural integrity
  - Aesthetic quality
  - Community impact
- **Visual indicators** with icons

### 4. Zoom Functionality (existing)
- **Full elevation view** (1x zoom)
- **Fence detail view** (3.5x zoom)
- **Horizontal panning** when zoomed
- **Transform origin** at fence Y position

---

## UI Components to Add

### Header Section
```
- Badge: "Fence Condition Comparison"
- Title: "Interactive Fence Map — Alley 3"
- Description: "Compare existing conditions with design interventions"
- Scenario selector buttons (3 options)
```

### Comparison Viewer
```
- Before image (existing fence photo)
- After image (render with medallions)
- Draggable slider handle
- Before/After labels
- Instruction text
```

### Metrics Panel
```
- Repair Cost card
- Fabrication Cost card
- Total Investment card
- Condition Score card
```

### Zoom Controls
```
- "Full Elevation" button
- "Fence Detail View" button
- Zoom level indicator
- Pan instructions
```

---

## Data Structure

### Fence Projects
```javascript
{
  "P2": {
    buildingImage: "static/images/Building 2 PNG.png",
    existingPhoto: "static/images/fence-photos/P2-existing.jpg",
    renderImage: "static/images/fence-photos/P2-render.jpg",
    repairCost: 5200,
    fabricationCost: 2800,
    condition: "Poor",
    structuralIssues: ["Rust", "Missing panels", "Loose posts"],
    medallionCount: 3
  }
}
```

### Scenarios
```javascript
[
  {
    id: 'existing',
    label: 'Existing Condition',
    desc: 'Current deteriorated state — rust, damage, safety concerns',
    color: '#e74c3c'
  },
  {
    id: 'repair',
    label: 'Structural Repair',
    desc: 'Fence repaired and reinforced — no decorative elements',
    color: '#e8a838'
  },
  {
    id: 'full',
    label: 'Full Intervention',
    desc: 'Repair + decorative medallions + community engagement',
    color: '#0FA4AF'
  }
]
```

---

## Implementation Steps

### Step 1: Add Comparison Slider HTML
- Create slider container
- Add before/after images
- Add draggable handle
- Add labels and instructions

### Step 2: Add Slider JavaScript
- Mouse/touch drag handlers
- Clip-path calculation
- Smooth animation
- Position constraints

### Step 3: Add Scenario Selector
- Button group
- Active state styling
- Click handlers
- Image switching

### Step 4: Add Metrics Display
- Cost cards
- Condition indicators
- Visual icons
- Comparison values

### Step 5: Integrate with Zoom
- Comparison slider in full view
- Zoom button switches to detail view
- Detail view shows fence close-up
- Pan controls for inspection

### Step 6: Polish & Transitions
- Smooth scenario switching
- Fade transitions
- Loading states
- Responsive design

---

## Visual Hierarchy

```
┌─────────────────────────────────────────┐
│ Header (Scenario Selector)              │
├─────────────────────────────────────────┤
│                                         │
│  Comparison Slider                      │
│  (Before ←→ After)                      │
│                                         │
├─────────────────────────────────────────┤
│ Metrics Panel (4 cards)                 │
├─────────────────────────────────────────┤
│ Zoom Controls                           │
│ [Full Elevation] [Fence Detail]         │
├─────────────────────────────────────────┤
│ Fence Detail Viewer (when zoomed)       │
│ (High-res inspection with pan)          │
└─────────────────────────────────────────┘
```

---

## Color Scheme (from React code)

- **Existing/Before:** `#e74c3c` (red)
- **Repair/Water:** `#e8a838` (orange)
- **Full/Complete:** `#0FA4AF` (cyan)
- **Success:** `#34d399` (green)
- **Background:** `#132f4c` (dark blue)
- **Panel:** `#1a3a54` (medium blue)
- **Border:** `rgba(15,164,175,0.2)` (cyan transparent)

---

## Next Steps

1. ✅ Create this plan document
2. ⏳ Implement comparison slider HTML/CSS
3. ⏳ Add slider drag functionality
4. ⏳ Add scenario selector
5. ⏳ Add metrics display
6. ⏳ Integrate with existing zoom
7. ⏳ Polish and test

---

**Status:** Planning complete, ready for implementation
**Priority:** High - improves UX significantly
**Estimated Time:** 2-3 hours for full integration
