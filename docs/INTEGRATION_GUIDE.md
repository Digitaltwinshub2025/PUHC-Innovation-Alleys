# Integration Guide - Connecting Alley Bloom to Your Main Site

Complete guide for integrating Alley Bloom with your main website.

---

## Overview

This guide explains how to connect the Alley Bloom design platform to your main PUHC website. There are multiple integration approaches depending on your needs.

---

## Integration Approaches

### Approach 1: Simple Link (Easiest)

Add a button/link in your main site's navigation:

```html
<!-- In your main site's HTML -->
<a href="https://alley-bloom.herokuapp.com" class="btn btn-primary" target="_blank">
  Launch Design Tool
</a>
```

**Pros:**
- Simple to implement
- No technical complexity
- Users can switch between sites easily

**Cons:**
- Opens in new tab/window
- No data sharing between sites

---

### Approach 2: Embedded IFrame

Embed Alley Bloom directly in your main site:

```html
<!-- In your main site's page -->
<div class="alley-bloom-container">
  <iframe 
    id="alley-bloom-frame"
    src="https://alley-bloom.herokuapp.com" 
    width="100%" 
    height="800px"
    title="Alley Bloom Design Tool"
    allow="fullscreen"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups">
  </iframe>
</div>

<style>
.alley-bloom-container {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

#alley-bloom-frame {
  display: block;
  border: none;
}
</style>
```

**Pros:**
- Seamless integration
- Keeps users on main site
- Professional appearance

**Cons:**
- Limited communication between sites
- IFrame restrictions
- Mobile responsiveness challenges

---

### Approach 3: API Integration (Most Powerful)

Create API endpoints in Alley Bloom that your main site can call:

#### Step 1: Add API Endpoints to app.py

```python
# In app.py - Add these routes

@app.route('/api/designs', methods=['GET'])
def get_all_designs():
    """Get all saved designs"""
    try:
        designs = data_manager.load_all_designs()
        return jsonify({
            'status': 'success',
            'designs': designs,
            'count': len(designs)
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/designs/<design_id>', methods=['GET'])
def get_design(design_id):
    """Get specific design by ID"""
    try:
        design = data_manager.load_design(design_id)
        if design:
            return jsonify({'status': 'success', 'design': design})
        return jsonify({'status': 'error', 'message': 'Design not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/designs', methods=['POST'])
def create_design():
    """Create new design"""
    try:
        data = request.json
        design_id = data_manager.save_design(data)
        return jsonify({
            'status': 'success',
            'design_id': design_id,
            'message': 'Design created successfully'
        }), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/designs/<design_id>', methods=['PUT'])
def update_design(design_id):
    """Update existing design"""
    try:
        data = request.json
        data_manager.update_design(design_id, data)
        return jsonify({
            'status': 'success',
            'message': 'Design updated successfully'
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/designs/<design_id>', methods=['DELETE'])
def delete_design(design_id):
    """Delete design"""
    try:
        data_manager.delete_design(design_id)
        return jsonify({
            'status': 'success',
            'message': 'Design deleted successfully'
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/alleys', methods=['GET'])
def get_alleys():
    """Get all alleys with metadata"""
    alleys = {
        'alley1': {'name': 'Energy Theme', 'lat': 34.04996, 'lng': -118.27987},
        'alley2': {'name': 'Sun Theme', 'lat': 34.04898, 'lng': -118.27988},
        'alley3': {'name': 'Water Theme', 'lat': 34.04965, 'lng': -118.28033},
        # ... add all 12 alleys
    }
    return jsonify({'status': 'success', 'alleys': alleys})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get platform statistics"""
    stats = {
        'total_designs': len(data_manager.load_all_designs()),
        'active_users': 0,  # Track if needed
        'alleys_designed': 0,  # Count from designs
    }
    return jsonify({'status': 'success', 'stats': stats})
```

#### Step 2: Call API from Main Site

```javascript
// In your main site's JavaScript

class AlleyBloomAPI {
  constructor(baseUrl = 'https://alley-bloom.herokuapp.com') {
    this.baseUrl = baseUrl;
  }

  // Get all designs
  async getDesigns() {
    try {
      const response = await fetch(`${this.baseUrl}/api/designs`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching designs:', error);
      return null;
    }
  }

  // Get specific design
  async getDesign(designId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/designs/${designId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching design:', error);
      return null;
    }
  }

  // Create new design
  async createDesign(designData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/designs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(designData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating design:', error);
      return null;
    }
  }

  // Get platform stats
  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }

  // Get all alleys
  async getAlleys() {
    try {
      const response = await fetch(`${this.baseUrl}/api/alleys`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching alleys:', error);
      return null;
    }
  }
}

// Usage in your main site
const api = new AlleyBloomAPI('https://alley-bloom.herokuapp.com');

// Display designs on main site
async function displayDesigns() {
  const result = await api.getDesigns();
  if (result.status === 'success') {
    console.log('Designs:', result.designs);
    // Render designs on your page
  }
}

// Display stats
async function displayStats() {
  const result = await api.getStats();
  if (result.status === 'success') {
    document.getElementById('design-count').textContent = result.stats.total_designs;
  }
}

// Call on page load
displayDesigns();
displayStats();
```

---

### Approach 4: Shared Authentication (Advanced)

If you want users to log in once and access both sites:

#### Step 1: Set Up OAuth2 or JWT

```python
# In app.py - Add authentication

from flask_jwt_extended import JWTManager, create_access_token, jwt_required

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
jwt = JWTManager(app)

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user"""
    data = request.json
    # Verify credentials against your user database
    if verify_user(data['email'], data['password']):
        access_token = create_access_token(identity=data['email'])
        return jsonify({'access_token': access_token})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    """Protected endpoint - requires valid token"""
    current_user = get_jwt_identity()
    return jsonify({'user': current_user})
```

#### Step 2: Use Token in Main Site

```javascript
// Store token from login
localStorage.setItem('alley_bloom_token', token);

// Use token in API calls
async function getProtectedData() {
  const token = localStorage.getItem('alley_bloom_token');
  const response = await fetch('https://alley-bloom.herokuapp.com/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}
```

---

## Implementation Steps

### Step 1: Choose Integration Approach

- **Simple Link** - For basic navigation
- **IFrame** - For embedded experience
- **API** - For data sharing
- **Shared Auth** - For seamless login

### Step 2: Update CORS Settings

In `app.py`, ensure CORS allows your main site:

```python
from flask_cors import CORS

# Allow your main site domain
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://yourmainsite.com",
            "https://www.yourmainsite.com"
        ]
    }
})
```

### Step 3: Test Integration

```bash
# Test API endpoint
curl https://alley-bloom.herokuapp.com/api/designs

# Test CORS
curl -H "Origin: https://yourmainsite.com" \
     -H "Access-Control-Request-Method: GET" \
     https://alley-bloom.herokuapp.com/api/designs
```

### Step 4: Deploy Both Sites

1. Deploy Alley Bloom to Heroku/Railway
2. Update main site with integration code
3. Deploy main site
4. Test integration end-to-end

---

## Example: Complete Integration

### Main Site HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>PUHC - Alley Transformation</title>
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="https://alley-bloom.herokuapp.com" target="_blank">
            Design Tool
        </a>
    </nav>

    <section id="designs">
        <h2>Recent Designs</h2>
        <div id="designs-container"></div>
    </section>

    <section id="stats">
        <h3>Platform Stats</h3>
        <p>Total Designs: <span id="design-count">0</span></p>
    </section>

    <script>
        const api = new AlleyBloomAPI('https://alley-bloom.herokuapp.com');

        // Load and display designs
        async function loadDesigns() {
            const result = await api.getDesigns();
            if (result && result.status === 'success') {
                const container = document.getElementById('designs-container');
                result.designs.forEach(design => {
                    container.innerHTML += `
                        <div class="design-card">
                            <h3>${design.name}</h3>
                            <p>${design.description}</p>
                            <a href="https://alley-bloom.herokuapp.com/design/${design.id}">
                                View Design
                            </a>
                        </div>
                    `;
                });
            }
        }

        // Load stats
        async function loadStats() {
            const result = await api.getStats();
            if (result && result.status === 'success') {
                document.getElementById('design-count').textContent = 
                    result.stats.total_designs;
            }
        }

        // Initialize on page load
        loadDesigns();
        loadStats();
    </script>
</body>
</html>
```

---

## Troubleshooting Integration

### CORS Errors

**Error:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**
```python
# In app.py
from flask_cors import CORS
CORS(app)  # Allow all origins (development only!)

# For production, specify allowed origins
CORS(app, resources={
    r"/api/*": {"origins": ["https://yourmainsite.com"]}
})
```

### IFrame Not Loading

**Error:** "Refused to display in a frame"

**Solution:**
Add to Alley Bloom's response headers:

```python
@app.after_request
def set_headers(response):
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    return response
```

### API Timeout

**Error:** "Request timeout"

**Solution:**
```javascript
// Add timeout to fetch
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

fetch(url, { signal: controller.signal })
  .finally(() => clearTimeout(timeoutId));
```

---

## Security Considerations

1. **Never expose API keys** in frontend code
2. **Use HTTPS** for all API calls
3. **Validate all inputs** on backend
4. **Rate limit API** to prevent abuse
5. **Use authentication tokens** for sensitive operations
6. **Sanitize user input** to prevent XSS attacks

---

## Performance Tips

1. **Cache API responses** on main site
2. **Use CDN** for static assets
3. **Minimize API calls** - batch when possible
4. **Lazy load** IFrame content
5. **Compress images** before upload

---

## Next Steps

1. Choose integration approach
2. Implement on main site
3. Test thoroughly
4. Deploy both sites
5. Monitor performance
6. Gather user feedback

---

## Support

For integration questions:
- Review Flask documentation
- Check CORS documentation
- Test with browser DevTools (F12)
- Review API responses in Network tab

