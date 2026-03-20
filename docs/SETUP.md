# Alley Bloom - Local Development Setup

Complete guide for setting up Alley Bloom on your local machine.

---

## Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/download/win)
- **Text Editor** - VS Code, PyCharm, or similar
- **API Keys** - Google Cloud, OpenWeatherMap (free tiers available)

---

## Installation Steps

### 1. Clone the Repository

```bash
# Using Git
git clone https://github.com/YOUR_USERNAME/alley-bloom.git
cd alley-bloom

# Or download ZIP and extract
```

### 2. Create Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**What gets installed:**
- Flask 3.0.0 - Web framework
- Flask-SocketIO 5.3.5 - Real-time WebSocket support
- Pillow 10.1.0 - Image processing
- Gunicorn 21.2.0 - Production server
- Plus 3 additional dependencies

### 4. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Required API Keys:**

1. **Google Cloud API Key**
   - Go to: https://console.cloud.google.com/
   - Create new project
   - Enable APIs:
     - Google Maps API
     - Google Street View API
     - Google Air Quality API
     - Google Places API
     - Google Elevation API
   - Create API key (Credentials)
   - Copy to `.env` file

2. **OpenWeatherMap API Key** (Optional)
   - Go to: https://openweathermap.org/api
   - Sign up for free account
   - Get API key
   - Copy to `.env` file

### 5. Run the Application

```bash
# Development mode (with auto-reload)
python app.py

# Or with Flask CLI
flask run

# Or with Gunicorn (production-like)
gunicorn --worker-class eventlet -w 1 app:app
```

### 6. Access the Application

Open your browser and go to:
```
http://localhost:5000
```

---

## Project Structure

```
alley-bloom/
├── app.py                      # Main Flask application
├── data_manager.py             # Data handling utilities
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── Procfile                   # Heroku deployment config
├── runtime.txt                # Python version for deployment
│
├── templates/                 # HTML pages
│   ├── index_unified.html     # Homepage
│   ├── design_workspace.html  # Design tool
│   ├── scenarios.html         # Scenario comparison
│   ├── innovation_alleys_map.html
│   ├── plant_library.html
│   ├── live_dashboard.html
│   ├── unreal_viewer.html     # Pixel Streaming viewer
│   ├── api_test.html
│   ├── demo_mode.html
│   ├── google_data_demo.html
│   └── street_view_designer.html
│
├── static/                    # Static assets
│   ├── css/                   # Stylesheets
│   │   ├── style.css
│   │   ├── design.css
│   │   ├── scenarios.css
│   │   └── ...
│   ├── js/                    # JavaScript files
│   │   ├── main.js
│   │   ├── design.js
│   │   ├── scenarios.js
│   │   └── ...
│   ├── images/                # Image assets
│   └── models/                # 3D models
│
├── data/                      # Data storage
│   └── scenarios.json
│
└── exports/                   # Export directory
    └── murals/                # Exported mural images
```

---

## Development Workflow

### Making Changes

1. **Edit files** in your text editor
2. **Save changes** - Flask auto-reloads in development mode
3. **Refresh browser** to see changes
4. **Check console** for errors (F12 in browser)

### Testing Features

**Design Workspace:**
- Open http://localhost:5000/design-workspace
- Drag items onto canvas
- Test real-time collaboration (open in 2 browser windows)

**Scenarios:**
- Open http://localhost:5000/scenarios
- View before/after comparisons

**API Integration:**
- Open http://localhost:5000/api-test
- Test Google Cloud APIs
- Verify API keys are working

**3D Viewer (Pixel Streaming):**
- Requires Unreal Engine running
- Open http://localhost:5000/unreal-viewer
- Should show live stream from Unreal

### Debugging

**Check Flask Logs:**
```bash
# Terminal where Flask is running shows all requests and errors
# Look for:
# - [ERROR] messages
# - [WARNING] messages
# - Stack traces
```

**Browser Console:**
```javascript
// Press F12 to open Developer Tools
// Check Console tab for JavaScript errors
// Check Network tab for API failures
```

**Test API Calls:**
```bash
# Test Google API
curl "https://airquality.googleapis.com/v1/currentConditions:lookup?key=YOUR_KEY&location.latitude=34.0475&location.longitude=-118.2795"

# Test OpenWeatherMap
curl "https://api.openweathermap.org/data/2.5/weather?lat=34.0475&lon=-118.2795&appid=YOUR_KEY"
```

---

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
# Make sure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Then install requirements
pip install -r requirements.txt
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Option 1: Kill the process using port 5000
# Windows: netstat -ano | findstr :5000
# Then: taskkill /PID <PID> /F

# Option 2: Use different port
python app.py --port 8080
# Then access: http://localhost:8080
```

### Issue: "API keys not working"

**Solution:**
1. Check `.env` file has correct keys
2. Verify APIs are enabled in Google Cloud Console
3. Check API key restrictions (should be unrestricted for development)
4. Test API directly with curl command
5. Check browser console for CORS errors

### Issue: "WebSocket connection failed"

**Solution:**
1. Ensure Flask-SocketIO is installed: `pip install Flask-SocketIO`
2. Check firewall allows port 5000
3. Try different browser (Chrome, Firefox)
4. Check browser console for connection errors

### Issue: "Real-time collaboration not working"

**Solution:**
1. Open same URL in 2 browser windows
2. Check both are on same alley
3. Check browser console for Socket.IO errors
4. Verify eventlet is installed: `pip install eventlet`

---

## Environment Variables

### Development (.env file)

```env
FLASK_ENV=development
GOOGLE_API_KEY=your_key_here
OPENWEATHER_KEY=your_key_here
SECRET_KEY=dev-secret-key
```

### Production (Set in hosting platform)

```env
FLASK_ENV=production
GOOGLE_API_KEY=your_production_key
OPENWEATHER_KEY=your_production_key
SECRET_KEY=strong-random-secret-key
```

---

## Database Setup (Optional)

If you want to use a database instead of JSON files:

### Install PostgreSQL

```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql
```

### Install Python PostgreSQL driver

```bash
pip install psycopg2-binary SQLAlchemy
```

### Update app.py

```python
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/alley_bloom'
db = SQLAlchemy(app)
```

---

## Testing

### Manual Testing Checklist

- [ ] Homepage loads
- [ ] All navigation links work
- [ ] Design workspace drag-and-drop works
- [ ] Real-time collaboration works (2 windows)
- [ ] Scenarios page loads and displays data
- [ ] Plant library displays all plants
- [ ] Google APIs return data
- [ ] Export to Unreal creates files
- [ ] Mobile responsive design works

### Automated Testing (Future)

```bash
# Install pytest
pip install pytest

# Run tests
pytest tests/
```

---

## Performance Tips

1. **Use Chrome DevTools** to profile performance
2. **Enable browser caching** for static files
3. **Minimize API calls** - cache results when possible
4. **Optimize images** - use WebP format
5. **Use CDN** for production - CloudFlare, AWS CloudFront

---

## Deployment Preparation

Before deploying to production:

1. **Update requirements.txt**
   ```bash
   pip freeze > requirements.txt
   ```

2. **Create Procfile** (for Heroku)
   ```
   web: gunicorn --worker-class eventlet -w 1 app:app
   ```

3. **Create runtime.txt** (for Heroku)
   ```
   python-3.11.7
   ```

4. **Test production build locally**
   ```bash
   gunicorn --worker-class eventlet -w 1 app:app
   ```

5. **Set environment variables** in hosting platform

---

## Next Steps

1. **Complete setup** following steps above
2. **Test all features** locally
3. **Get API keys** from Google Cloud and OpenWeatherMap
4. **Customize** as needed for your use case
5. **Deploy** to GitHub and hosting platform

---

## Support & Resources

- **Flask Documentation:** https://flask.palletsprojects.com/
- **Flask-SocketIO:** https://flask-socketio.readthedocs.io/
- **Google Cloud APIs:** https://cloud.google.com/docs
- **OpenWeatherMap API:** https://openweathermap.org/api
- **Python Virtual Environments:** https://docs.python.org/3/tutorial/venv.html

---

**Ready to start developing? Run `python app.py` and open http://localhost:5000!**
