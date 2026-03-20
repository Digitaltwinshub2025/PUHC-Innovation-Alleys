from flask import Flask, render_template, request, jsonify, send_file, session, redirect
from flask_socketio import SocketIO, emit, join_room, leave_room
from PIL import Image
import json
import io
import os
import requests
from werkzeug.utils import secure_filename
from data_manager import data_manager
from content_manager import content_manager
from models import db, User, Scenario, ScenarioVersion, Collaboration, Export
from dotenv import load_dotenv
from functools import wraps
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'alley-transformation-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///alley_bloom.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")

def is_edit_allowed():
    """Edit mode only works on localhost"""
    host = request.host.split(':')[0]
    return host in ('localhost', '127.0.0.1')

# Add aggressive cache-busting headers for development
@app.after_request
def add_cache_headers(response):
    # AGGRESSIVE NO-CACHE for all responses in development
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    # Remove ETags to prevent conditional requests
    if 'ETag' in response.headers:
        del response.headers['ETag']
    
    # Force fresh content with timestamp
    response.headers['Last-Modified'] = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
    
    # Add timestamp to prevent any caching
    response.headers['X-Timestamp'] = str(datetime.utcnow().timestamp())
    
    return response

# ============================================================================
# API KEYS - Load from environment variables
# ============================================================================

# Google Cloud API Configuration
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')

# Unsplash API - Professional Images
UNSPLASH_KEY = os.environ.get('UNSPLASH_KEY', '')

# OpenWeatherMap API - Real-time Weather Data
OPENWEATHER_KEY = os.environ.get('OPENWEATHER_KEY', '')

# Validate critical keys
if not GOOGLE_API_KEY or GOOGLE_API_KEY == 'YOUR_KEY_HERE':
    print("WARNING: GOOGLE_API_KEY not configured. Some features will not work.")

# NASA POWER API - No key needed! Free solar radiation data
# iNaturalist API - No key needed! Free biodiversity data
# USGS Water Services - No key needed! Free water data

# Pico-Union coordinates - 12 Innovation Alleys (CORRECT COORDINATES)
PICO_UNION_COORDS = {
    'alley1': {'lat': 34.05029712004266, 'lng': -118.28298209970326},  # Energy
    'alley2': {'lat': 34.0483347119334, 'lng': -118.28278909472274},  # Sun
    'alley3': {'lat': 34.04982619528969, 'lng': -118.2818586747943},  # Water (primary prototype)
    'alley4': {'lat': 34.051573754452384, 'lng': -118.28210289757493},  # Universe
    'alley5': {'lat': 34.0512482767413, 'lng': -118.2809130897754},  # Air
    'alley6': {'lat': 34.05069899513361, 'lng': -118.27979221364627},  # Earth
    'alley7': {'lat': 34.05021760023289, 'lng': -118.27868110207845},  # Humanity
    'alley8': {'lat': 34.049753910675584, 'lng': -118.27759968651065},  # Animals
    'alley9': {'lat': 34.049217918459284, 'lng': -118.2764975596723},  # Plants
    'alley10': {'lat': 34.04311380244757, 'lng': -118.27473862298159}, # Minerals
    'alley11': {'lat': 34.04390854936556, 'lng': -118.27670128625326}, # Insects
    'alley12': {'lat': 34.04434271351046, 'lng': -118.27771370076478}, # Prosperity
    'default': {'lat': 34.04982619528969, 'lng': -118.2818586747943}
}

# Store design states for different alleys
alley_designs = {}

# ============================================================================
# GOOGLE CLOUD API FUNCTIONS - REAL DATA
# ============================================================================

def get_google_air_quality(lat, lng):
    """
    Get real air quality data from Google Air Quality API
    Returns: temperature, AQI, PM2.5, pollutants
    """
    try:
        url = "https://airquality.googleapis.com/v1/currentConditions:lookup"
        headers = {
            'Content-Type': 'application/json',
        }
        params = {
            'key': GOOGLE_API_KEY
        }
        payload = {
            "location": {
                "latitude": lat,
                "longitude": lng
            },
            "extraComputations": [
                "HEALTH_RECOMMENDATIONS",
                "DOMINANT_POLLUTANT_CONCENTRATION",
                "POLLUTANT_CONCENTRATION"
            ]
        }
        
        response = requests.post(url, headers=headers, params=params, json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract air quality index
            aqi = 'N/A'
            pm25 = 'N/A'
            
            if 'indexes' in data and len(data['indexes']) > 0:
                aqi = data['indexes'][0].get('aqi', 'N/A')
            
            # Extract PM2.5 if available
            if 'pollutants' in data:
                for pollutant in data['pollutants']:
                    if pollutant.get('code') == 'pm25':
                        pm25 = pollutant.get('concentration', {}).get('value', 'N/A')
            
            return {
                'aqi': aqi,
                'pm25': pm25,
                'temperature': None,  # Air Quality API doesn't provide temp
                'data_available': True
            }
        else:
            print(f"Air Quality API error: {response.status_code}")
            return {'aqi': 'N/A', 'pm25': 'N/A', 'temperature': None, 'data_available': False}
            
    except Exception as e:
        print(f"Error fetching air quality: {e}")
        return {'aqi': 'N/A', 'pm25': 'N/A', 'temperature': None, 'data_available': False}


def get_google_places_activity(lat, lng):
    """
    Get community activity data from Google Places API
    Returns: nearby businesses, activity level estimate
    """
    try:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            'location': f'{lat},{lng}',
            'radius': 500,  # 500 meters around alley
            'key': GOOGLE_API_KEY
        }
        
        response = requests.get(url, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            
            # Count different types of places
            business_count = len(results)
            
            # Estimate activity level based on number of places
            # More places = more foot traffic
            if business_count > 50:
                activity_level = 10
            elif business_count > 30:
                activity_level = 7
            elif business_count > 15:
                activity_level = 5
            else:
                activity_level = 3
            
            # Get types of places
            place_types = {}
            for place in results:
                for place_type in place.get('types', []):
                    place_types[place_type] = place_types.get(place_type, 0) + 1
            
            return {
                'business_count': business_count,
                'activity_level': activity_level,
                'place_types': place_types,
                'data_available': True
            }
        else:
            print(f"Places API error: {response.status_code}")
            return {'business_count': 0, 'activity_level': 0, 'data_available': False}
            
    except Exception as e:
        print(f"Error fetching places data: {e}")
        return {'business_count': 0, 'activity_level': 0, 'data_available': False}


def get_google_elevation(lat, lng):
    """
    Get elevation data for water runoff calculations
    Returns: elevation in meters, slope estimate
    """
    try:
        url = "https://maps.googleapis.com/maps/api/elevation/json"
        
        # Get elevation at multiple points to calculate slope
        points = [
            f'{lat},{lng}',
            f'{lat + 0.0005},{lng}',  # ~50m north
            f'{lat},{lng + 0.0005}'   # ~50m east
        ]
        
        params = {
            'locations': '|'.join(points),
            'key': GOOGLE_API_KEY
        }
        
        response = requests.get(url, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            
            if len(results) >= 3:
                elevations = [r['elevation'] for r in results]
                avg_elevation = sum(elevations) / len(elevations)
                
                # Calculate rough slope
                elevation_diff = max(elevations) - min(elevations)
                slope_percent = (elevation_diff / 50) * 100  # Rough estimate
                
                return {
                    'elevation': avg_elevation,
                    'slope_percent': slope_percent,
                    'data_available': True
                }
        
        return {'elevation': 0, 'slope_percent': 0, 'data_available': False}
        
    except Exception as e:
        print(f"Error fetching elevation: {e}")
        return {'elevation': 0, 'slope_percent': 0, 'data_available': False}

@app.route('/')
def index():
    edit_mode = request.args.get('edit') == 'true' and is_edit_allowed()
    page_content = content_manager.load_page_content('home') or {}
    areas = {
        'a': content_manager.load_area_content('area-a') or {},
        'b': content_manager.load_area_content('area-b') or {},
        'c': content_manager.load_area_content('area-c') or {},
        'd': content_manager.load_area_content('area-d') or {},
    }
    return render_template('index_unified.html', edit_mode=edit_mode, content=page_content, areas=areas)

@app.route('/street-view-designer')
def street_view_designer():
    # Redirect to new visualization studio
    return redirect('/visualization-studio')

@app.route('/design-brief')
def design_brief():
    # Design Brief Generator - Data-driven recommendations for eco-cultural corridor transformation
    return render_template('design_brief.html')

@app.route('/design-workspace')
def design_workspace():
    # Co-Design Studio - Canvas-based design workspace with real-time collaboration
    return render_template('design_workspace.html')

@app.route('/scenarios')
def scenarios():
    # Scenario management dashboard
    return render_template('scenarios.html')

@app.route('/plant-library')
def plant_library():
    # Climate-appropriate plant library
    return render_template('plant_library.html')

@app.route('/visualization-studio')
def visualization_studio():
    # Street View visualization studio
    return render_template('visualization_studio.html')

@app.route('/before-after')
def before_after():
    # Before and after scenario comparison (legacy route)
    return render_template('before_after.html')

@app.route('/existing')
def existing():
    # Existing conditions page with Figma-style layout
    google_api_key = GOOGLE_API_KEY if GOOGLE_API_KEY else ''
    edit_mode = request.args.get('edit') == 'true' and is_edit_allowed()
    page_content = content_manager.load_page_content('existing') or {}
    return render_template('existing_new.html', google_api_key=google_api_key, edit_mode=edit_mode, content=page_content)

@app.route('/compare')
def compare():
    # Compare before/after with intervention toggles
    edit_mode = request.args.get('edit') == 'true' and is_edit_allowed()
    page_content = content_manager.load_page_content('compare') or {}
    return render_template('compare.html', edit_mode=edit_mode, content=page_content)

@app.route('/urban-farming')
def urban_farming():
    # Urban Farming education and Digital Twin integration page
    return render_template('urban_farming.html')

@app.route('/solar-shades')
def solar_shades():
    # Solar Shades intervention page for Alley 3
    return render_template('solar_shades.html')

@app.route('/murals')
def murals():
    # Community Murals intervention page for Alley 3
    return render_template('murals.html')

@app.route('/trellises')
def trellises():
    # Redirect to solar-shades - trellises and medallions are part of the integrated shade structure system
    return redirect(url_for('solar_shades'))

@app.route('/fence-map')
def fence_map():
    # Redirect to new interactive fence map
    return redirect('/interactive-fence-map')

@app.route('/interactive-fence-map')
def interactive_fence_map():
    # Serve the standalone interactive fence map with medallion customization
    return send_file('interactive-fence-map.html')

@app.route('/rhino-viewer')
def rhino_viewer():
    # 3DM file viewer using Three.js + rhino3dm.js
    return send_file('rhino-viewer.html')

@app.route('/rhino-file/<path:filename>')
def serve_rhino_file(filename):
    # Serve .3dm files from the user's Desktop for viewing
    desktop_path = os.path.expanduser('~/Desktop')
    file_path = os.path.join(desktop_path, filename)
    if os.path.exists(file_path) and filename.endswith('.3dm'):
        return send_file(file_path, mimetype='application/octet-stream')
    return jsonify({'error': 'File not found'}), 404

@app.route('/api/cost-data')
def api_cost_data():
    # Serve structured cost data JSON for fence map and other dynamic pages
    cost_data_path = os.path.join(os.path.dirname(__file__), 'content', 'cost_data.json')
    try:
        with open(cost_data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/customize/<project_id>')
def customize_project(project_id):
    # Placeholder route for project customization page
    return render_template('fence_map.html')

@app.route('/design-library')
def design_library():
    # Searchable design element library for Alley 3
    return render_template('design_library.html')

@app.route('/api/nasa-temperature')
def get_nasa_temperature():
    """Fetch real surface temperature from NASA POWER API for the alley location"""
    try:
        # NASA POWER API - Free, no key needed!
        url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        
        # Alley coordinates: W 11th & W 12th St, Pico-Union
        params = {
            'parameters': 'T2M,T2M_MAX,T2M_MIN',  # Temperature at 2 meters (air temp near surface)
            'community': 'RE',  # Renewable Energy community
            'longitude': -118.28129,
            'latitude': 34.04927,
            'start': '20241101',  # Last 30 days
            'end': '20241130',
            'format': 'JSON'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Get the most recent temperature data
        if 'properties' in data and 'parameter' in data['properties']:
            temps = data['properties']['parameter']
            
            # Get latest values
            t2m_data = temps.get('T2M', {})
            latest_date = max(t2m_data.keys()) if t2m_data else None
            
            if latest_date:
                current_temp = t2m_data[latest_date]
                
                return jsonify({
                    'success': True,
                    'temperature': round(current_temp * 9/5 + 32, 1),  # Convert C to F
                    'date': latest_date,
                    'location': 'Alley corridor between W 11th & W 12th St, Pico-Union',
                    'coordinates': {'lat': 34.04927, 'lng': -118.28129},
                    'source': 'NASA POWER',
                    'source_full': 'NASA Prediction Of Worldwide Energy Resources',
                    'description': 'Satellite-derived surface temperature data',
                    'url': 'https://power.larc.nasa.gov/'
                })
        
        raise Exception('No temperature data available')
        
    except Exception as e:
        print(f"Error fetching NASA temperature: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Using estimated temperature data'
        }), 500

@app.route('/api/plants')
def get_plants():
    """Fetch California native plants from iNaturalist API"""
    try:
        # iNaturalist API - Get iconic taxa (plants) native to California
        # Place ID 14 = California
        url = "https://api.inaturalist.org/v1/taxa"
        params = {
            'iconic_taxa': 'Plantae',  # Plants only
            'place_id': 14,  # California
            'native': 'true',  # Native species only
            'rank': 'species',  # Species level
            'per_page': 50,  # Get 50 plants
            'order': 'desc',
            'order_by': 'observations_count',  # Most observed first
            'q': 'native california drought tolerant'  # Search query
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Format the data for our plant library
        plants = []
        for taxon in data.get('results', []):
            plant = {
                'id': taxon.get('id'),
                'name': taxon.get('name'),
                'common_name': taxon.get('preferred_common_name', taxon.get('name')),
                'scientific_name': taxon.get('name'),
                'photo': taxon.get('default_photo', {}).get('medium_url', ''),
                'wikipedia_url': taxon.get('wikipedia_url', ''),
                'observations_count': taxon.get('observations_count', 0),
                'native': True,
                'drought_tolerant': True,  # Filtered by query
                'type': 'Native California'
            }
            plants.append(plant)
        
        return jsonify({
            'success': True,
            'plants': plants,
            'count': len(plants),
            'source': 'iNaturalist API'
        })
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching plants from iNaturalist: {e}")
        # Return fallback data if API fails
        fallback_plants = [
            {
                'id': 1,
                'name': 'California Poppy',
                'common_name': 'California Poppy',
                'scientific_name': 'Eschscholzia californica',
                'photo': '',
                'wikipedia_url': 'https://en.wikipedia.org/wiki/Eschscholzia_californica',
                'observations_count': 5000,
                'native': True,
                'drought_tolerant': True,
                'type': 'Native California'
            },
            {
                'id': 2,
                'name': 'Desert Marigold',
                'common_name': 'Desert Marigold',
                'scientific_name': 'Baileya multiradiata',
                'photo': '',
                'wikipedia_url': 'https://en.wikipedia.org/wiki/Baileya_multiradiata',
                'observations_count': 3000,
                'native': True,
                'drought_tolerant': True,
                'type': 'Native California'
            },
            {
                'id': 3,
                'name': 'Toyon',
                'common_name': 'Toyon',
                'scientific_name': 'Heteromeles arbutifolia',
                'photo': '',
                'wikipedia_url': 'https://en.wikipedia.org/wiki/Heteromeles_arbutifolia',
                'observations_count': 4000,
                'native': True,
                'drought_tolerant': True,
                'type': 'Native California'
            },
            {
                'id': 4,
                'name': 'Coyote Brush',
                'common_name': 'Coyote Brush',
                'scientific_name': 'Baccharis pilularis',
                'photo': '',
                'wikipedia_url': 'https://en.wikipedia.org/wiki/Baccharis_pilularis',
                'observations_count': 3500,
                'native': True,
                'drought_tolerant': True,
                'type': 'Native California'
            },
            {
                'id': 5,
                'name': 'California Buckwheat',
                'common_name': 'California Buckwheat',
                'scientific_name': 'Eriogonum fasciculatum',
                'photo': '',
                'wikipedia_url': 'https://en.wikipedia.org/wiki/Eriogonum_fasciculatum',
                'observations_count': 2800,
                'native': True,
                'drought_tolerant': True,
                'type': 'Native California'
            }
        ]
        return jsonify({
            'success': False,
            'error': str(e),
            'plants': fallback_plants,
            'message': 'Using cached plant data'
        }), 200

@app.route('/innovation-alleys-map')
def innovation_alleys_map():
    # 12 Innovation Alleys themed map
    return render_template('innovation_alleys_map.html')

@app.route('/api/images/<query>', methods=['GET'])
def get_images(query):
    """Search for images from Unsplash API"""
    try:
        if not UNSPLASH_KEY or UNSPLASH_KEY == '':
            return jsonify({'error': 'Unsplash API key not configured', 'results': []}), 200
        
        url = "https://api.unsplash.com/search/photos"
        params = {
            'query': query,
            'per_page': 10,
            'client_id': UNSPLASH_KEY
        }
        
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            return jsonify(response.json())
        return jsonify({'error': 'Failed to fetch images', 'results': []}), 200
    except Exception as e:
        print(f"Error fetching images: {e}")
        return jsonify({'error': str(e), 'results': []}), 200

@app.route('/api/weather/<lat>/<lng>', methods=['GET'])
def get_weather(lat, lng):
    """Get weather data from OpenWeatherMap"""
    try:
        if not OPENWEATHER_KEY or OPENWEATHER_KEY == '':
            return jsonify({'error': 'OpenWeatherMap API key not configured', 'main': {'temp': 75, 'humidity': 50}, 'weather': [{'description': 'unavailable'}]}), 200
        
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': lat,
            'lon': lng,
            'units': 'imperial',
            'appid': OPENWEATHER_KEY
        }
        
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            return jsonify(response.json())
        return jsonify({'error': 'Failed to fetch weather', 'main': {'temp': 75, 'humidity': 50}, 'weather': [{'description': 'unavailable'}]}), 200
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return jsonify({'error': str(e), 'main': {'temp': 75, 'humidity': 50}, 'weather': [{'description': 'unavailable'}]}), 200

@app.route('/api/solar/<lat>/<lng>', methods=['GET'])
def get_solar(lat, lng):
    """Get solar radiation data from NASA POWER API"""
    try:
        url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        params = {
            'parameters': 'ALLSKY_SFC_SW_DWN',
            'community': 'RE',
            'longitude': lng,
            'latitude': lat,
            'start': '20241101',
            'end': '20241130',
            'format': 'JSON'
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return jsonify(response.json())
        return jsonify({'error': 'Failed to fetch solar data', 'parameters': {}}), 200
    except Exception as e:
        print(f"Error fetching solar data: {e}")
        return jsonify({'error': str(e), 'parameters': {}}), 200

@app.route('/api/species/<lat>/<lng>', methods=['GET'])
def get_species(lat, lng):
    """Get species observations from iNaturalist API"""
    try:
        url = "https://api.inaturalist.org/v1/observations"
        params = {
            'lat': lat,
            'lng': lng,
            'radius': 1000,
            'per_page': 50,
            'order_by': 'created_at',
            'order': 'desc'
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return jsonify(response.json())
        return jsonify({'error': 'Failed to fetch species data', 'results': [], 'total_results': 0}), 200
    except Exception as e:
        print(f"Error fetching species data: {e}")
        return jsonify({'error': str(e), 'results': [], 'total_results': 0}), 200

@app.route('/api/water/<site_id>', methods=['GET'])
def get_water(site_id):
    """Get water data from USGS Water Services"""
    try:
        url = "https://waterservices.usgs.gov/nwis/iv/"
        params = {
            'sites': site_id,
            'format': 'json',
            'parameterCd': '00060,00065'
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return jsonify(response.json())
        return jsonify({'error': 'Failed to fetch water data', 'value': {'timeSeries': []}}), 200
    except Exception as e:
        print(f"Error fetching water data: {e}")
        return jsonify({'error': str(e), 'value': {'timeSeries': []}}), 200

@app.route('/api/scenarios', methods=['GET'])
def get_scenarios():
    """Get all scenarios from data file"""
    scenarios = data_manager.load_scenarios()
    return jsonify({'scenarios': scenarios})

@app.route('/api/scenarios/<scenario_id>', methods=['GET'])
def get_scenario(scenario_id):
    """Get a specific scenario by ID"""
    scenario = data_manager.get_scenario_by_id(scenario_id)
    if scenario:
        return jsonify(scenario)
    return jsonify({'error': 'Scenario not found'}), 404

@app.route('/api/scenarios', methods=['POST'])
def create_scenario():
    """Create or update a scenario"""
    scenario_data = request.get_json()
    success = data_manager.save_scenario(scenario_data)
    if success:
        return jsonify({'success': True, 'message': 'Scenario saved'})
    return jsonify({'success': False, 'error': 'Failed to save scenario'}), 500

@app.route('/api/scenarios/<scenario_id>', methods=['DELETE'])
def delete_scenario(scenario_id):
    """Delete a scenario"""
    success = data_manager.delete_scenario(scenario_id)
    if success:
        return jsonify({'success': True, 'message': 'Scenario deleted'})
    return jsonify({'success': False, 'error': 'Failed to delete scenario'}), 500

@app.route('/api/scenarios/seed', methods=['POST'])
def seed_scenarios():
    """
    Efficiently seed demo scenarios with real Google + NASA data
    Creates baseline & vision scenarios for Alley 3 using live APIs
    """
    import datetime
    import concurrent.futures
    
    try:
        alley_id = 'alley3'
        coords = PICO_UNION_COORDS.get(alley_id, PICO_UNION_COORDS['default'])
        
        # Fetch all real data in parallel for efficiency (1 network round-trip)
        real_data = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            # Submit all API calls simultaneously
            future_air = executor.submit(get_google_air_quality, coords['lat'], coords['lng'])
            future_places = executor.submit(get_google_places_activity, coords['lat'], coords['lng'])
            future_elevation = executor.submit(get_google_elevation, coords['lat'], coords['lng'])
            
            # NASA temperature needs different params, call separately
            try:
                nasa_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
                nasa_params = {
                    'parameters': 'T2M',
                    'community': 'RE',
                    'longitude': coords['lng'],
                    'latitude': coords['lat'],
                    'start': '20241101',
                    'end': '20241130',
                    'format': 'JSON'
                }
                nasa_response = requests.get(nasa_url, params=nasa_params, timeout=10)
                if nasa_response.status_code == 200:
                    nasa_data = nasa_response.json()
                    if 'properties' in nasa_data and 'parameter' in nasa_data['properties']:
                        t2m_data = nasa_data['properties']['parameter'].get('T2M', {})
                        latest_date = max(t2m_data.keys()) if t2m_data else None
                        if latest_date:
                            real_data['temperature_c'] = t2m_data[latest_date]
                            real_data['temperature_f'] = round(real_data['temperature_c'] * 9/5 + 32, 1)
            except:
                real_data['temperature_f'] = 96  # Fallback
            
            # Collect results
            real_data['air_quality'] = future_air.result()
            real_data['places'] = future_places.result()
            real_data['elevation'] = future_elevation.result()
        
        # Extract key metrics (with fallbacks)
        baseline_temp = real_data.get('temperature_f', 96)
        aqi = real_data['air_quality'].get('aqi', 92)
        pm25 = real_data['air_quality'].get('pm25', 35)
        
        # Create BASELINE scenario using real data
        baseline = {
            'id': f'{alley_id}-baseline',
            'name': 'Baseline: Current Conditions',
            'type': 'baseline',
            'location': {
                'name': 'Alley corridor between W 11th & W 12th St, Pico-Union',
                'address': 'Pico-Union, Los Angeles, CA',
                'coordinates': coords
            },
            'dimensions': {
                'length': 150,
                'width': 12,
                'unit': 'ft'
            },
            'phase': 'Planning',
            'last_updated': datetime.datetime.now().isoformat().split('T')[0],
            'layers': [],
            'environmental_data': {
                'temperature': baseline_temp,
                'shade_coverage': 0,
                'air_quality': aqi if isinstance(aqi, (int, float)) else 92,
                'green_space': 0,
                'pm25': pm25 if isinstance(pm25, (int, float)) else 35,
                'water_runoff': 95,
                'data_source': 'Google Cloud + NASA POWER APIs',
                'last_sync': datetime.datetime.now().isoformat()
            },
            'notes': f'Current alley state with real data from Google Air Quality (AQI: {aqi}, PM2.5: {pm25}) and NASA temperature ({baseline_temp}°F). No green infrastructure, concrete surfaces, poor drainage.'
        }
        
        # Create VISION scenario with realistic improvements
        vision_temp = baseline_temp - 8  # Trees reduce temp by ~8°F
        vision_aqi = max(50, aqi - 30) if isinstance(aqi, (int, float)) else 62  # Plants improve AQI
        
        vision = {
            'id': f'{alley_id}-vision',
            'name': 'Vision: Full Green Transformation',
            'type': 'vision',
            'location': baseline['location'].copy(),
            'dimensions': baseline['dimensions'].copy(),
            'phase': 'Planning',
            'last_updated': datetime.datetime.now().isoformat().split('T')[0],
            'layers': ['bioswales', 'rain_gardens', 'native_plants', 'permeable_pavement', 'community_murals'],
            'environmental_data': {
                'temperature': vision_temp,
                'shade_coverage': 65,
                'air_quality': vision_aqi,
                'green_space': 65,
                'pm25': max(10, pm25 - 20) if isinstance(pm25, (int, float)) else 15,
                'water_capture': 500,  # gallons/month
                'water_runoff': 35,  # reduced from 95%
                'data_source': 'Projected based on green infrastructure models',
                'baseline_comparison': {
                    'temperature_change': -8,
                    'shade_increase': 65,
                    'aqi_improvement': baseline['environmental_data']['air_quality'] - vision_aqi,
                    'runoff_reduction': 60
                }
            },
            'notes': 'Complete transformation: bioswales, rain gardens, native plants, permeable pavement, community murals. Temperature reduced by 8°F, 65% shade coverage, improved air quality, 500+ gallons rainwater capture monthly.'
        }
        
        # Save both scenarios efficiently (single write operation per scenario)
        success_baseline = data_manager.save_scenario(baseline)
        success_vision = data_manager.save_scenario(vision)
        
        if success_baseline and success_vision:
            return jsonify({
                'success': True,
                'message': 'Demo scenarios seeded with real data',
                'scenarios_created': 2,
                'data_sources': {
                    'google_air_quality': real_data['air_quality'].get('data_available', False),
                    'google_places': real_data['places'].get('data_available', False),
                    'google_elevation': real_data['elevation'].get('data_available', False),
                    'nasa_temperature': 'temperature_f' in real_data
                },
                'scenarios': [baseline['id'], vision['id']]
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save scenarios'
            }), 500
            
    except Exception as e:
        print(f"Error seeding scenarios: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to seed scenarios with real data'
        }), 500

@app.route('/live-dashboard')
def live_dashboard():
    # Live data tracking dashboard
    return render_template('live_dashboard.html')

@app.route('/api/live-data/<alley_id>', methods=['GET'])
def get_live_data(alley_id):
    """Get live data for specific alley - NOW WITH REAL GOOGLE DATA"""
    import random
    import datetime
    
    # Get coordinates for the alley
    coords = PICO_UNION_COORDS.get(alley_id, PICO_UNION_COORDS['default'])
    
    # Get real air quality from Google
    air_quality = get_google_air_quality(coords['lat'], coords['lng'])
    
    # Get real community activity from Google Places
    activity_data = get_google_places_activity(coords['lat'], coords['lng'])
    
    # Combine real and calculated data
    if alley_id == 'all':
        data = {
            'temperature': air_quality.get('temperature', 75),
            'air_quality_index': air_quality.get('aqi', 'N/A'),
            'pm25': air_quality.get('pm25', 'N/A'),
            'water_captured_today': random.randint(10, 20),  # TODO: Calculate from real rainfall
            'shade_coverage': 45 + random.uniform(-3, 3),
            'active_users': activity_data.get('activity_level', 5),
            'nearby_businesses': activity_data.get('business_count', 0),
            'timestamp': datetime.datetime.now().isoformat(),
            'data_source': 'Google Cloud APIs'
        }
    else:
        scenario = data_manager.get_scenario_by_id(f"{alley_id}-baseline")
        if scenario and scenario.get('environmental_data'):
            env = scenario['environmental_data']
            
            # Helper function to safely extract values from either simple or nested objects
            def get_value(field, default=None):
                if field is None:
                    return default
                if isinstance(field, dict):
                    return field.get('value', default)
                return field
            
            # Safely extract temperature
            temperature = get_value(env.get('temperature'), 95)
            
            # Safely extract shade coverage
            shade_coverage = get_value(env.get('shade_coverage'), 10)
            
            data = {
                'temperature': temperature,
                'air_quality_index': air_quality.get('aqi', 'N/A'),
                'pm25': air_quality.get('pm25', 'N/A'),
                'water_captured_today': random.randint(5, 15),
                'shade_coverage': shade_coverage + random.uniform(-2, 2),
                'active_users': activity_data.get('activity_level', 3),
                'nearby_businesses': activity_data.get('business_count', 0),
                'timestamp': datetime.datetime.now().isoformat(),
                'data_source': 'Google Cloud APIs'
            }
        else:
            data = {'error': 'Alley not found'}
    
    return jsonify(data)

@app.route('/digital-twin')
@app.route('/unreal-viewer')  # Legacy route for compatibility
def digital_twin():
    # Digital Twin - Unreal Engine Pixel Streaming viewer
    return render_template('unreal_viewer.html')

@app.route('/api/google-data/<alley_id>', methods=['GET'])
def get_google_data(alley_id):
    """
    NEW ENDPOINT: Get comprehensive Google Cloud data for an alley
    Demonstrates real API integration
    """
    import datetime
    
    # Get coordinates
    coords = PICO_UNION_COORDS.get(alley_id, PICO_UNION_COORDS['default'])
    
    # Fetch all Google data
    air_quality = get_google_air_quality(coords['lat'], coords['lng'])
    places = get_google_places_activity(coords['lat'], coords['lng'])
    elevation = get_google_elevation(coords['lat'], coords['lng'])
    
    # Compile comprehensive data
    response = {
        'alley_id': alley_id,
        'location': {
            'latitude': coords['lat'],
            'longitude': coords['lng'],
            'neighborhood': 'Pico-Union, Los Angeles'
        },
        'air_quality': {
            'aqi': air_quality.get('aqi', 'N/A'),
            'pm25': air_quality.get('pm25', 'N/A'),
            'source': 'Google Air Quality API',
            'available': air_quality.get('data_available', False)
        },
        'community_activity': {
            'nearby_businesses': places.get('business_count', 0),
            'activity_level': places.get('activity_level', 0),
            'place_types': places.get('place_types', {}),
            'source': 'Google Places API',
            'available': places.get('data_available', False)
        },
        'terrain': {
            'elevation_meters': elevation.get('elevation', 0),
            'slope_percent': elevation.get('slope_percent', 0),
            'source': 'Google Elevation API',
            'available': elevation.get('data_available', False)
        },
        'timestamp': datetime.datetime.now().isoformat(),
        'data_sources': 'Google Cloud Platform APIs'
    }
    
    return jsonify(response)

# NEW: Export to Unreal - File-Based Integration
@app.route('/api/update-digital-twin', methods=['POST'])
@app.route('/api/export-to-unreal', methods=['POST'])  # Legacy endpoint
def update_digital_twin():
    """
    Update Digital Twin - Export design to Unreal Engine via shared folder.
    Saves JSON with mural data + PNG files.
    """
    try:
        data = request.get_json()
        
        # Extract design data
        project_name = data.get('project_name', 'alley_design')
        alley_id = data.get('alley_id', 'unknown')
        murals = data.get('murals', [])
        
        # Create export folder (cross-platform)
        export_base = os.environ.get('PUHC_EXPORT_PATH', os.path.join(os.path.expanduser('~'), 'PUHC_Exports'))
        export_folder = export_base
        os.makedirs(export_folder, exist_ok=True)
        
        # Generate timestamp for unique export
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        export_name = f"{project_name}_{timestamp}"
        
        # Process murals and save images
        processed_murals = []
        for idx, mural in enumerate(murals):
            mural_id = f"mural_{idx+1:03d}"
            
            # Save image if base64 data provided
            if 'imageData' in mural:
                image_data = mural['imageData']
                # Remove data URL prefix if present
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                # Decode and save image
                import base64
                image_bytes = base64.b64decode(image_data)
                image_path = os.path.join(export_folder, f"{export_name}_{mural_id}.png")
                
                with open(image_path, 'wb') as f:
                    f.write(image_bytes)
            
            # Build mural metadata for Unreal
            processed_mural = {
                'id': mural_id,
                'filename': f"{export_name}_{mural_id}.png",
                'position': {
                    'x': float(mural.get('x', 0)) / 10,  # Convert pixels to Unreal units
                    'y': float(mural.get('y', 0)) / 10,
                    'z': 0.0
                },
                'rotation': {
                    'pitch': 0.0,
                    'yaw': float(mural.get('rotation', 0)),
                    'roll': 0.0
                },
                'scale': {
                    'width': float(mural.get('width', 100)) / 100,  # Convert to meters
                    'height': float(mural.get('height', 100)) / 100,
                    'depth': 0.1
                },
                'material_properties': {
                    'opacity': float(mural.get('opacity', 1.0)),
                    'blend_mode': 'translucent' if mural.get('opacity', 1.0) < 1.0 else 'opaque',
                    'emissive': False
                }
            }
            processed_murals.append(processed_mural)
        
        # Create JSON export
        export_data = {
            'project_info': {
                'name': project_name,
                'export_date': datetime.now().isoformat(),
                'designer': 'Community Member',
                'alley_id': alley_id
            },
            'scenario': 'vision',
            'murals': processed_murals,
            'metadata': {
                'total_murals': len(processed_murals),
                'export_version': '1.0',
                'coordinate_system': 'unreal_units'
            }
        }
        
        # Save JSON file
        json_path = os.path.join(export_folder, f"{export_name}.json")
        with open(json_path, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': f'Exported {len(processed_murals)} murals to Unreal',
            'export_folder': export_folder,
            'json_file': f"{export_name}.json",
            'files_created': len(processed_murals) + 1
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Export failed: {str(e)}'
        }), 500

# NEW: PNG Conversion API for Unreal Integration
@app.route('/api/convert-to-png', methods=['POST'])
def convert_to_png():
    """
    Convert uploaded image to PNG with transparency support.
    Accepts: JPG, JPEG, PNG, WebP
    Returns: PNG file with preserved/added transparency
    """
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'File type not supported. Allowed: {", ".join(allowed_extensions)}'}), 400
        
        # Open image with PIL
        image = Image.open(file.stream)
        
        # Convert to RGBA (supports transparency)
        if image.mode != 'RGBA':
            # If image has transparency info, preserve it
            if image.mode == 'P' and 'transparency' in image.info:
                image = image.convert('RGBA')
            else:
                # Convert to RGBA and add white background
                rgba_image = Image.new('RGBA', image.size, (255, 255, 255, 255))
                if image.mode == 'RGB':
                    rgba_image.paste(image, (0, 0))
                else:
                    rgba_image.paste(image.convert('RGB'), (0, 0))
                image = rgba_image
        
        # Save to bytes buffer
        img_io = io.BytesIO()
        image.save(img_io, 'PNG', optimize=True)
        img_io.seek(0)
        
        # Generate output filename
        original_name = secure_filename(file.filename.rsplit('.', 1)[0])
        output_filename = f'{original_name}.png'
        
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name=output_filename
        )
    
    except Exception as e:
        return jsonify({'error': f'Image conversion failed: {str(e)}'}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connection_response', {'data': 'Connected to co-design space'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_alley')
def handle_join_alley(data):
    alley_id = data['alley_id']
    join_room(alley_id)
    
    # Send current design state to the new user
    if alley_id in alley_designs:
        emit('load_design', {'items': alley_designs[alley_id]}, room=request.sid)
    else:
        alley_designs[alley_id] = []
    
    emit('user_joined', {'message': 'A resident joined the design space'}, room=alley_id, skip_sid=request.sid)

@socketio.on('leave_alley')
def handle_leave_alley(data):
    alley_id = data['alley_id']
    leave_room(alley_id)
    emit('user_left', {'message': 'A resident left the design space'}, room=alley_id)

@socketio.on('add_item')
def handle_add_item(data):
    alley_id = data['alley_id']
    item = data['item']
    
    if alley_id not in alley_designs:
        alley_designs[alley_id] = []
    
    alley_designs[alley_id].append(item)
    
    # Broadcast to all users in the same alley
    emit('item_added', {'item': item}, room=alley_id, include_self=False)

@socketio.on('update_item')
def handle_update_item(data):
    alley_id = data['alley_id']
    item = data['item']
    
    if alley_id in alley_designs:
        # Update the item in the design
        for i, existing_item in enumerate(alley_designs[alley_id]):
            if existing_item['id'] == item['id']:
                alley_designs[alley_id][i] = item
                break
    
    # Broadcast to all users in the same alley
    emit('item_updated', {'item': item}, room=alley_id, include_self=False)

@socketio.on('remove_item')
def handle_remove_item(data):
    alley_id = data['alley_id']
    item_id = data['item_id']
    
    if alley_id in alley_designs:
        alley_designs[alley_id] = [item for item in alley_designs[alley_id] if item['id'] != item_id]
    
    # Broadcast to all users in the same alley
    emit('item_removed', {'item_id': item_id}, room=alley_id, include_self=False)

@socketio.on('clear_design')
def handle_clear_design(data):
    alley_id = data['alley_id']
    
    if alley_id in alley_designs:
        alley_designs[alley_id] = []
    
    # Broadcast to all users in the same alley
    emit('design_cleared', {}, room=alley_id, include_self=False)

# ============================================================================
# AUTHENTICATION ENDPOINTS - Phase 3
# ============================================================================

def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        full_name = data.get('full_name', '')
        
        # Validation
        if not username or not email or not password:
            return jsonify({'error': 'Missing required fields'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if user exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 409
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409
        
        # Create user
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            full_name=full_name,
            role='user'
        )
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        session['username'] = user.username
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is disabled'}), 403
        
        session['user_id'] = user.id
        session['username'] = user.username
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out'}), 200

@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current user info"""
    user = User.query.get(session.get('user_id'))
    if user:
        return jsonify(user.to_dict()), 200
    return jsonify({'error': 'User not found'}), 404

# ============================================================================
# DATABASE PERSISTENCE ENDPOINTS - Phase 3
# ============================================================================

@app.route('/api/scenarios/db', methods=['GET'])
def get_scenarios_db():
    """Get all scenarios from database"""
    try:
        scenarios = Scenario.query.all()
        return jsonify({
            'success': True,
            'scenarios': [s.to_dict() for s in scenarios],
            'count': len(scenarios)
        }), 200
    except Exception as e:
        print(f"Error fetching scenarios: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scenarios/db', methods=['POST'])
def create_scenario_db():
    """Create or update scenario in database"""
    try:
        data = request.get_json()
        scenario_id = data.get('id')
        
        if not scenario_id:
            return jsonify({'error': 'Scenario ID required'}), 400
        
        # Check if exists
        scenario = Scenario.query.get(scenario_id)
        
        if scenario:
            # Update existing
            scenario.name = data.get('name', scenario.name)
            scenario.description = data.get('description', scenario.description)
            scenario.type = data.get('type', scenario.type)
            scenario.location = data.get('location', scenario.location)
            scenario.dimensions = data.get('dimensions', scenario.dimensions)
            scenario.phase = data.get('phase', scenario.phase)
            scenario.layers = data.get('layers', scenario.layers)
            scenario.environmental_data = data.get('environmental_data', scenario.environmental_data)
            scenario.notes = data.get('notes', scenario.notes)
            scenario.version += 1
        else:
            # Create new
            scenario = Scenario(
                id=scenario_id,
                name=data.get('name', 'Untitled Scenario'),
                description=data.get('description', ''),
                type=data.get('type', 'baseline'),
                alley_id=data.get('alley_id', 'unknown'),
                location=data.get('location'),
                dimensions=data.get('dimensions'),
                phase=data.get('phase', 'Planning'),
                layers=data.get('layers', []),
                environmental_data=data.get('environmental_data'),
                notes=data.get('notes', ''),
                created_by=session.get('user_id'),
                is_public=data.get('is_public', False)
            )
        
        db.session.add(scenario)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Scenario saved',
            'scenario': scenario.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error saving scenario: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scenarios/db/<scenario_id>', methods=['DELETE'])
def delete_scenario_db(scenario_id):
    """Delete scenario from database"""
    try:
        scenario = Scenario.query.get(scenario_id)
        
        if not scenario:
            return jsonify({'error': 'Scenario not found'}), 404
        
        db.session.delete(scenario)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Scenario deleted'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting scenario: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# EXPORT/IMPORT ENDPOINTS - Phase 3
# ============================================================================

@app.route('/api/scenarios/export/<scenario_id>/<export_type>', methods=['GET'])
def export_scenario(scenario_id, export_type):
    """Export scenario in various formats"""
    try:
        scenario = Scenario.query.get(scenario_id)
        
        if not scenario:
            return jsonify({'error': 'Scenario not found'}), 404
        
        if export_type == 'json':
            # Export as JSON
            return jsonify(scenario.to_dict()), 200
        
        elif export_type == 'csv':
            # Export environmental data as CSV
            import csv
            from io import StringIO
            
            output = StringIO()
            writer = csv.writer(output)
            
            # Write headers
            writer.writerow(['Metric', 'Value', 'Unit'])
            
            # Write data
            env_data = scenario.environmental_data or {}
            for key, value in env_data.items():
                if isinstance(value, dict):
                    writer.writerow([key, value.get('value', ''), value.get('unit', '')])
                else:
                    writer.writerow([key, value, ''])
            
            output.seek(0)
            return output.getvalue(), 200, {'Content-Type': 'text/csv'}
        
        else:
            return jsonify({'error': 'Unsupported export format'}), 400
    
    except Exception as e:
        print(f"Export error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scenarios/import', methods=['POST'])
def import_scenario():
    """Import scenario from JSON"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Create scenario from imported data
        scenario = Scenario(
            id=data.get('id', f"imported_{datetime.utcnow().timestamp()}"),
            name=data.get('name', 'Imported Scenario'),
            description=data.get('description', ''),
            type=data.get('type', 'baseline'),
            alley_id=data.get('alley_id', 'unknown'),
            location=data.get('location'),
            dimensions=data.get('dimensions'),
            phase=data.get('phase', 'Planning'),
            layers=data.get('layers', []),
            environmental_data=data.get('environmental_data'),
            notes=data.get('notes', ''),
            created_by=session.get('user_id'),
            is_public=data.get('is_public', False)
        )
        
        db.session.add(scenario)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Scenario imported',
            'scenario': scenario.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Import error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-design', methods=['POST'])
def save_design():
    """Save mural design to backend"""
    try:
        data = request.json
        alley = data.get('alley', 'unknown')
        murals = data.get('murals', [])
        timestamp = data.get('timestamp', datetime.utcnow().isoformat())
        
        # Save design data
        design_data = {
            'alley': alley,
            'murals': murals,
            'timestamp': timestamp,
            'count': len(murals)
        }
        
        # Store in data folder
        import os
        data_folder = os.path.join(os.path.dirname(__file__), 'data')
        os.makedirs(data_folder, exist_ok=True)
        
        designs_file = os.path.join(data_folder, 'designs.json')
        designs = []
        
        if os.path.exists(designs_file):
            with open(designs_file, 'r') as f:
                designs = json.load(f)
        
        designs.append(design_data)
        
        with open(designs_file, 'w') as f:
            json.dump(designs, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': f'Design saved with {len(murals)} murals',
            'design': design_data
        })
    except Exception as e:
        print(f"Error saving design: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/explore-alleys')
def explore_alleys():
    """Legacy route - redirect to visualization studio"""
    return redirect('/visualization-studio')

@app.route('/api/scenario-detail/<scenario_id>')
def get_scenario_detail(scenario_id):
    """Get scenario data by ID for visualization studio"""
    try:
        # Try to get from database first
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if scenario:
            return jsonify(scenario.to_dict())
        
        # Fallback to JSON file
        scenario_data = data_manager.get_scenario_by_id(scenario_id)
        if scenario_data:
            return jsonify(scenario_data)
        
        return jsonify({'error': 'Scenario not found'}), 404
    except Exception as e:
        print(f"Error fetching scenario: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-view', methods=['POST'])
def save_view():
    """Save Street View visualization state"""
    try:
        data = request.json
        scenario_id = data.get('scenario_id', 'default')
        alley_id = data.get('alley_id')
        viewpoint_id = data.get('viewpoint_id', 'start')
        camera = data.get('camera', {})
        overlays = data.get('overlays', {})
        timestamp = data.get('timestamp', datetime.utcnow().isoformat())
        
        # Create view data structure
        view_data = {
            'scenario_id': scenario_id,
            'alley_id': alley_id,
            'viewpoint_id': viewpoint_id,
            'camera': {
                'heading': camera.get('heading', 0),
                'pitch': camera.get('pitch', 0),
                'zoom': camera.get('zoom', 1)
            },
            'overlays': {
                'murals': overlays.get('murals', True),
                'greenery': overlays.get('greenery', True),
                'lighting': overlays.get('lighting', True),
                'street_furniture': overlays.get('street_furniture', True),
                'opacity': overlays.get('opacity', 1)
            },
            'timestamp': timestamp
        }
        
        # Store in data folder
        import os
        data_folder = os.path.join(os.path.dirname(__file__), 'data')
        os.makedirs(data_folder, exist_ok=True)
        
        views_file = os.path.join(data_folder, 'views.json')
        views = []
        
        if os.path.exists(views_file):
            with open(views_file, 'r') as f:
                views = json.load(f)
        
        views.append(view_data)
        
        with open(views_file, 'w') as f:
            json.dump(views, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'View saved successfully',
            'view': view_data
        })
    except Exception as e:
        print(f"Error saving view: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/scenarios/comparison')
def get_scenario_comparison():
    """Get comparison data for Before & After page"""
    try:
        alley_id = request.args.get('alley_id', 'alley3')
        
        # Get baseline and concept scenarios
        baseline = data_manager.get_scenario_by_id(f'baseline-{alley_id}')
        concepts = [
            data_manager.get_scenario_by_id(f'concept-a-{alley_id}'),
            data_manager.get_scenario_by_id(f'concept-b-{alley_id}')
        ]
        
        return jsonify({
            'alley_id': alley_id,
            'baseline': baseline or {},
            'concepts': [c for c in concepts if c]
        })
    except Exception as e:
        print(f"Error fetching comparison: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# PIXEL STREAMING - Integrated Signaling Server
# ============================================================================
# This allows Unreal Engine to connect directly to this Flask server
# No need for a separate signaling server!

# Store connected Pixel Streaming clients
pixel_streaming_clients = {
    'streamers': {},  # Unreal Engine instances
    'players': {}     # Web browser viewers
}

@socketio.on('connect', namespace='/pixelstreaming')
def pixel_streaming_connect():
    """Handle new Pixel Streaming connection"""
    print(f"[Pixel Streaming] New connection: {request.sid}")
    emit('config', {
        'peerConnectionOptions': {
            'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]
        }
    })

@socketio.on('disconnect', namespace='/pixelstreaming')
def pixel_streaming_disconnect():
    """Handle Pixel Streaming disconnection"""
    sid = request.sid
    print(f"[Pixel Streaming] Disconnected: {sid}")
    
    # Remove from streamers or players
    if sid in pixel_streaming_clients['streamers']:
        del pixel_streaming_clients['streamers'][sid]
        # Notify all players that streamer disconnected
        emit('streamerDisconnected', broadcast=True, namespace='/pixelstreaming')
    if sid in pixel_streaming_clients['players']:
        del pixel_streaming_clients['players'][sid]

@socketio.on('streamerConnect', namespace='/pixelstreaming')
def streamer_connect():
    """Unreal Engine streamer connects"""
    sid = request.sid
    pixel_streaming_clients['streamers'][sid] = {'connected_at': datetime.utcnow().isoformat()}
    print(f"[Pixel Streaming] Streamer registered: {sid}")
    
    # Notify all players that a streamer is available
    emit('streamerConnected', broadcast=True, namespace='/pixelstreaming')

@socketio.on('playerConnect', namespace='/pixelstreaming')  
def player_connect():
    """Web browser player connects"""
    sid = request.sid
    pixel_streaming_clients['players'][sid] = {'connected_at': datetime.utcnow().isoformat()}
    print(f"[Pixel Streaming] Player registered: {sid}")
    
    # Check if streamer is available
    if pixel_streaming_clients['streamers']:
        emit('streamerConnected')
    else:
        emit('streamerDisconnected')

@socketio.on('offer', namespace='/pixelstreaming')
def handle_offer(data):
    """Forward WebRTC offer from streamer to player"""
    player_id = data.get('playerId')
    if player_id:
        emit('offer', data, room=player_id, namespace='/pixelstreaming')
    else:
        # Broadcast to all players
        emit('offer', data, broadcast=True, namespace='/pixelstreaming', include_self=False)

@socketio.on('answer', namespace='/pixelstreaming')
def handle_answer(data):
    """Forward WebRTC answer from player to streamer"""
    # Send to first available streamer
    for streamer_id in pixel_streaming_clients['streamers']:
        emit('answer', data, room=streamer_id, namespace='/pixelstreaming')
        break

@socketio.on('iceCandidate', namespace='/pixelstreaming')
def handle_ice_candidate(data):
    """Forward ICE candidates between peers"""
    target = data.get('playerId') or data.get('streamerId')
    if target:
        emit('iceCandidate', data, room=target, namespace='/pixelstreaming')
    else:
        emit('iceCandidate', data, broadcast=True, namespace='/pixelstreaming', include_self=False)

@app.route('/api/pixel-streaming/status')
def pixel_streaming_status():
    """Get Pixel Streaming connection status"""
    return jsonify({
        'streamers_connected': len(pixel_streaming_clients['streamers']),
        'players_connected': len(pixel_streaming_clients['players']),
        'server_url': f"ws://localhost:5000/pixelstreaming",
        'status': 'ready' if pixel_streaming_clients['streamers'] else 'waiting_for_streamer'
    })

# ============================================================================
# ROOM CODE SYSTEM FOR PEER STREAMING
# ============================================================================

streaming_rooms = {}  # { 'ALLEY-XXXX': { 'ip': '192.168.1.50', 'created': datetime, 'creator_ip': '...' } }

@app.route('/api/rooms/create', methods=['POST'])
def create_room():
    """Create a new streaming room with a unique code"""
    import random
    import string
    
    # Generate unique room code
    while True:
        code = 'ALLEY-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        if code not in streaming_rooms:
            break
    
    # Get creator's IP (for network streaming)
    creator_ip = request.remote_addr
    if creator_ip == '127.0.0.1':
        creator_ip = 'localhost'
    
    # Store room info
    streaming_rooms[code] = {
        'ip': creator_ip,
        'created': datetime.now().isoformat(),
        'creator_ip': request.remote_addr
    }
    
    print(f"[Rooms] Created room {code} for IP {creator_ip}")
    
    return jsonify({
        'code': code,
        'ip': creator_ip,
        'share_url': f"/digital-twin?room={code}"
    })

@app.route('/api/rooms/<code>')
def get_room(code):
    """Get room info by code"""
    code = code.upper()
    if code in streaming_rooms:
        room = streaming_rooms[code]
        return jsonify({
            'code': code,
            'ip': room['ip'],
            'created': room['created']
        })
    return jsonify({'error': 'Room not found'}), 404

@app.route('/api/rooms/list')
def list_rooms():
    """List all active rooms"""
    rooms = []
    for code, room in streaming_rooms.items():
        rooms.append({
            'code': code,
            'ip': room['ip'],
            'created': room['created']
        })
    return jsonify({'rooms': rooms})

@app.route('/api/rooms/<code>', methods=['DELETE'])
def delete_room(code):
    """Delete a room"""
    code = code.upper()
    if code in streaming_rooms:
        del streaming_rooms[code]
        return jsonify({'success': True})
    return jsonify({'error': 'Room not found'}), 404

# ============================================================================
# EDIT MODE API - Content read/write for localhost editing
# Only functional on localhost. No layout changes, no DOM mutation.
# ============================================================================

EDIT_MODE_ALLOWED_CATEGORIES = ['pages', 'areas', 'media', 'theme']

@app.route('/api/content/<category>/<filename>', methods=['GET'])
def get_content(category, filename):
    """Read a content JSON file"""
    if category not in EDIT_MODE_ALLOWED_CATEGORIES:
        return jsonify({'error': 'Invalid category'}), 400
    data = content_manager.read(category, filename)
    if data is None:
        return jsonify({'error': 'Content not found'}), 404
    return jsonify(data)

@app.route('/api/content/<category>/<filename>', methods=['POST'])
def save_content(category, filename):
    """Write a content JSON file. Localhost only."""
    if not is_edit_allowed():
        return jsonify({'error': 'Edit mode is only available on localhost'}), 403
    if category not in EDIT_MODE_ALLOWED_CATEGORIES:
        return jsonify({'error': 'Invalid category'}), 400
    data = request.get_json()
    if data is None:
        return jsonify({'error': 'Invalid JSON body'}), 400
    try:
        content_manager.write(category, filename, data)
        return jsonify({'success': True, 'message': f'{category}/{filename} saved'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/content-list/<category>', methods=['GET'])
def list_content(category):
    """List all content files in a category"""
    if category not in EDIT_MODE_ALLOWED_CATEGORIES:
        return jsonify({'error': 'Invalid category'}), 400
    files = content_manager.list_files(category)
    return jsonify({'files': files})


if __name__ == '__main__':
    # Initialize database
    with app.app_context():
        db.create_all()
        print("Database initialized successfully")
    
    # Display network information for local collaboration
    import socket
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print("\n" + "="*60)
        print("ALLEY BLOOM - Innovation Alleys Platform")
        print("="*60)
        print(f"Local Access:     http://localhost:5000")
        print(f"Network Access:   http://{local_ip}:5000")
        print(f"Share with team:  http://{local_ip}:5000")
        print("="*60)
        print("Database: SQLite (alley_bloom.db)")
        print("Authentication: Enabled")
        print("="*60)
        print("PIXEL STREAMING (Unreal Engine)")
        print(f"Signaling URL:    ws://localhost:5000/pixelstreaming")
        print(f"Network URL:      ws://{local_ip}:5000/pixelstreaming")
        print("Add this URL to your Unreal Engine project!")
        print("="*60 + "\n")
    except:
        print("\nAlley Bloom is running on http://localhost:5000\n")
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
