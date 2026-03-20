"""
Simple data manager for Alley Bloom scenarios
Loads data from JSON files - easy to edit without coding
"""
import json
import os

class DataManager:
    def __init__(self):
        self.data_folder = os.path.join(os.path.dirname(__file__), 'data')
        self.scenarios_file = os.path.join(self.data_folder, 'scenarios.json')
        
    def load_scenarios(self):
        """Load all scenarios from JSON file"""
        try:
            with open(self.scenarios_file, 'r') as f:
                data = json.load(f)
                return data.get('scenarios', [])
        except FileNotFoundError:
            print(f"Warning: {self.scenarios_file} not found. Using demo data.")
            return self._get_demo_scenarios()
        except json.JSONDecodeError as e:
            print(f"Error reading scenarios.json: {e}")
            return self._get_demo_scenarios()
    
    def get_scenario_by_id(self, scenario_id):
        """Get a specific scenario by ID"""
        scenarios = self.load_scenarios()
        for scenario in scenarios:
            if scenario['id'] == scenario_id:
                return scenario
        return None
    
    def save_scenario(self, scenario):
        """Save or update a scenario"""
        scenarios = self.load_scenarios()
        
        # Check if scenario exists
        existing_index = None
        for i, s in enumerate(scenarios):
            if s['id'] == scenario['id']:
                existing_index = i
                break
        
        # Update or append
        if existing_index is not None:
            scenarios[existing_index] = scenario
        else:
            scenarios.append(scenario)
        
        # Save to file
        with open(self.scenarios_file, 'w') as f:
            json.dump({'scenarios': scenarios}, f, indent=2)
        
        return True
    
    def delete_scenario(self, scenario_id):
        """Delete a scenario"""
        scenarios = self.load_scenarios()
        scenarios = [s for s in scenarios if s['id'] != scenario_id]
        
        with open(self.scenarios_file, 'w') as f:
            json.dump({'scenarios': scenarios}, f, indent=2)
        
        return True
    
    def _get_demo_scenarios(self):
        """Fallback demo data if JSON file doesn't exist"""
        return [
            {
                "id": "alley3-baseline",
                "name": "Baseline: Current Conditions",
                "type": "baseline",
                "location": {
                    "name": "Alley corridor between W 11th & W 12th St, Pico-Union",
                    "address": "Pico-Union, Los Angeles, CA",
                    "coordinates": {"lat": 34.04965, "lng": -118.28033}
                },
                "phase": "Planning",
                "last_updated": "2025-12-17",
                "dimensions": {"length": 150, "width": 12, "unit": "ft"},
                "layers": [],
                "environmental_data": {
                    "temperature": 95,
                    "shade_coverage": 0,
                    "air_quality": 92,
                    "green_space": 0,
                    "pm25": 35,
                    "water_runoff": 95,
                    "data_source": "Google Cloud + NASA POWER APIs",
                    "last_sync": "2025-12-17T10:46:00"
                },
                "notes": "Current alley state with real data from Google Air Quality (AQI: 92, PM2.5: 35) and NASA temperature (95°F). No green infrastructure, concrete surfaces, poor drainage."
            },
            {
                "id": "alley3-vision",
                "name": "Vision: Full Green Transformation",
                "type": "vision",
                "location": {
                    "name": "Alley corridor between W 11th & W 12th St, Pico-Union",
                    "address": "Pico-Union, Los Angeles, CA",
                    "coordinates": {"lat": 34.04965, "lng": -118.28033}
                },
                "phase": "Planning",
                "last_updated": "2025-12-17",
                "dimensions": {"length": 150, "width": 12, "unit": "ft"},
                "layers": ["bioswales", "rain_gardens", "native_plants", "permeable_pavement", "community_murals"],
                "environmental_data": {
                    "temperature": 87,
                    "shade_coverage": 65,
                    "air_quality": 62,
                    "green_space": 65,
                    "pm25": 15,
                    "water_capture": 500,
                    "water_runoff": 35,
                    "data_source": "Projected based on green infrastructure models",
                    "baseline_comparison": {
                        "temperature_change": -8,
                        "shade_increase": 65,
                        "aqi_improvement": 30,
                        "runoff_reduction": 60
                    }
                },
                "notes": "Complete transformation: bioswales, rain gardens, native plants, permeable pavement, community murals. Temperature reduced by 8°F, 65% shade coverage, improved air quality, 500+ gallons rainwater capture monthly."
            }
        ]

# Create global instance
data_manager = DataManager()
