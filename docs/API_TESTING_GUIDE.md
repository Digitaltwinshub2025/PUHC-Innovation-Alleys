# 🔌 API Testing Guide - Alley Bloom

## 🎯 **Part 2: Show Me the API**

Your Alley Bloom platform now has a full REST API for managing scenario data!

---

## 📡 **Available API Endpoints**

### **1. Get All Scenarios**
```http
GET /api/scenarios
```

**Response:**
```json
{
  "scenarios": [
    {
      "id": "alley1-baseline",
      "name": "Alley 1 - Pico & Alvarado (Baseline)",
      "type": "baseline",
      "location": {
        "address": "Alley between Pico Blvd and W 12th St...",
        "coordinates": { "lat": 34.0470, "lng": -118.2800 }
      },
      "environmental_data": { ... }
    },
    ...
  ]
}
```

---

### **2. Get Specific Scenario**
```http
GET /api/scenarios/alley1-baseline
```

**Response:**
```json
{
  "id": "alley1-baseline",
  "name": "Alley 1 - Pico & Alvarado (Baseline)",
  ...
}
```

---

### **3. Create/Update Scenario**
```http
POST /api/scenarios
Content-Type: application/json

{
  "id": "alley2-baseline",
  "name": "Alley 2 - New Alley",
  "type": "baseline",
  "location": {
    "address": "123 Main St",
    "coordinates": { "lat": 34.05, "lng": -118.25 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scenario saved"
}
```

---

### **4. Delete Scenario**
```http
DELETE /api/scenarios/alley2-baseline
```

**Response:**
```json
{
  "success": true,
  "message": "Scenario deleted"
}
```

---

## 🧪 **Test the API - 3 Methods**

### **Method 1: Browser Console (Easiest)**

Open your browser console (F12) and run:

```javascript
// Get all scenarios
fetch('/api/scenarios')
  .then(r => r.json())
  .then(data => console.log(data));

// Get specific scenario
fetch('/api/scenarios/alley1-baseline')
  .then(r => r.json())
  .then(data => console.log(data));

// Create new scenario
fetch('/api/scenarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: "test-alley",
    name: "Test Alley",
    type: "baseline",
    location: { address: "Test Address" },
    phase: "Testing"
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

---

### **Method 2: PowerShell (Command Line)**

```powershell
# Get all scenarios
Invoke-RestMethod -Uri http://localhost:5000/api/scenarios -Method GET

# Get specific scenario
Invoke-RestMethod -Uri http://localhost:5000/api/scenarios/alley1-baseline -Method GET

# Create scenario
$body = @{
    id = "test-alley"
    name = "Test Alley"
    type = "baseline"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/scenarios -Method POST -Body $body -ContentType "application/json"

# Delete scenario
Invoke-RestMethod -Uri http://localhost:5000/api/scenarios/test-alley -Method DELETE
```

---

### **Method 3: Python Script**

Create `test_api.py`:

```python
import requests
import json

BASE_URL = "http://localhost:5000/api"

# Get all scenarios
response = requests.get(f"{BASE_URL}/scenarios")
print("All Scenarios:")
print(json.dumps(response.json(), indent=2))

# Get specific scenario
response = requests.get(f"{BASE_URL}/scenarios/alley1-baseline")
print("\nAlley 1 Baseline:")
print(json.dumps(response.json(), indent=2))

# Create new scenario
new_scenario = {
    "id": "test-alley",
    "name": "Test Alley",
    "type": "baseline",
    "location": {
        "address": "Test Address",
        "coordinates": {"lat": 34.05, "lng": -118.25}
    },
    "phase": "Testing"
}

response = requests.post(f"{BASE_URL}/scenarios", json=new_scenario)
print("\nCreate Response:")
print(response.json())

# Delete scenario
response = requests.delete(f"{BASE_URL}/scenarios/test-alley")
print("\nDelete Response:")
print(response.json())
```

Run it:
```bash
py test_api.py
```

---

## 🎮 **Interactive API Testing**

### **Test in Browser Right Now:**

1. **Open:** http://localhost:5000/scenarios
2. **Press F12** to open console
3. **Run this:**

```javascript
// Test 1: Get all scenarios
console.log("=== TEST 1: Get All Scenarios ===");
fetch('/api/scenarios')
  .then(r => r.json())
  .then(data => {
    console.log(`Found ${data.scenarios.length} scenarios:`);
    data.scenarios.forEach(s => console.log(`  - ${s.name}`));
  });

// Test 2: Get Alley 1
console.log("\n=== TEST 2: Get Alley 1 ===");
fetch('/api/scenarios/alley1-baseline')
  .then(r => r.json())
  .then(data => {
    console.log(`Name: ${data.name}`);
    console.log(`Address: ${data.location.address}`);
    console.log(`Temperature: ${data.environmental_data.temperature.value}°F`);
  });

// Test 3: Create test scenario
console.log("\n=== TEST 3: Create Test Scenario ===");
fetch('/api/scenarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: "api-test",
    name: "API Test Alley",
    type: "baseline",
    location: { address: "API Test Location" },
    phase: "Testing API",
    environmental_data: {
      temperature: { value: 100, unit: "°F" }
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log("Created:", data);
  // Reload page to see new scenario
  setTimeout(() => location.reload(), 2000);
});
```

---

## 📊 **What You'll See**

After running the tests, you'll see:
1. **Console output** showing all scenarios
2. **New scenario card** appears on the page
3. **Real data** loaded from `scenarios.json`

---

## 🔄 **Full Workflow Example**

### **Scenario: Add Alley 2 via API**

```javascript
// Step 1: Define the new alley
const alley2 = {
  id: "alley2-baseline",
  name: "Alley 2 - Union Ave (Baseline)",
  type: "baseline",
  location: {
    name: "Pico-Union",
    address: "Alley behind Union Ave, Los Angeles, CA",
    coordinates: {
      lat: 34.0480,
      lng: -118.2750
    }
  },
  dimensions: {
    length: 160,
    width: 13,
    unit: "ft"
  },
  phase: "Planning",
  last_updated: new Date().toISOString().split('T')[0],
  layers: ["As-Built Model", "Current Conditions"],
  environmental_data: {
    temperature: { value: 94, unit: "°F", change: null },
    shade_coverage: { value: 10, unit: "%", change: null },
    biodiversity: { level: "Low", species_count: 2 }
  }
};

// Step 2: Save to API
fetch('/api/scenarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(alley2)
})
.then(r => r.json())
.then(result => {
  console.log("Saved:", result);
  // Reload to see new alley
  location.reload();
});

// Step 3: Verify it's in the JSON file
// Check: data/scenarios.json
```

---

## 🎯 **Real-World Use Cases**

### **Use Case 1: Bulk Import from Spreadsheet**

```javascript
// You have 12 alleys in a spreadsheet
const alleys = [
  { id: "alley1", address: "...", lat: 34.047, lng: -118.28 },
  { id: "alley2", address: "...", lat: 34.048, lng: -118.275 },
  // ... 10 more
];

// Import all at once
alleys.forEach(alley => {
  fetch('/api/scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `${alley.id}-baseline`,
      name: `${alley.id} - Baseline`,
      type: "baseline",
      location: {
        address: alley.address,
        coordinates: { lat: alley.lat, lng: alley.lng }
      },
      phase: "Planning"
    })
  });
});
```

---

### **Use Case 2: Update Environmental Data**

```javascript
// Got new ECOSTRESS data for Alley 1
fetch('/api/scenarios/alley1-baseline')
  .then(r => r.json())
  .then(scenario => {
    // Update temperature with real data
    scenario.environmental_data.temperature.value = 97.3;
    scenario.environmental_data.temperature.source = "ECOSTRESS 2025-11-12";
    
    // Save back
    return fetch('/api/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario)
    });
  })
  .then(r => r.json())
  .then(result => console.log("Updated:", result));
```

---

## 🐛 **Troubleshooting**

### **Error: 404 Not Found**
- Make sure Flask app is running
- Check URL: `http://localhost:5000/api/scenarios`

### **Error: 500 Internal Server Error**
- Check `scenarios.json` syntax
- Look at Flask console for error details

### **Scenario not appearing**
- Refresh the page
- Check browser console for errors
- Verify JSON file was updated

---

## 📝 **API Response Examples**

### **Success Response:**
```json
{
  "success": true,
  "message": "Scenario saved"
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "Failed to save scenario"
}
```

### **Not Found:**
```json
{
  "error": "Scenario not found"
}
```

---

## 🚀 **Next Steps**

1. **Test the API** using browser console
2. **Add more alleys** via API or JSON file
3. **Integrate with other tools** (spreadsheets, GIS software)
4. **Build custom tools** using the API

---

**Your API is live and ready to use!** 🎉
