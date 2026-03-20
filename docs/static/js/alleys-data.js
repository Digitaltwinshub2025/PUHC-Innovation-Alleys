// Centralized Alley Data for All Pages
// This data flows through Design Studio, Digital Twin, Before & After, and other pages

const ALLEYS_DATA = {
    'alley-1': {
        id: 'alley-1',
        name: 'Alley 1',
        theme: 'Energy',
        address: 'S Alvarado to S Lake St, Between 11th St & 12th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        dimensions: '150ft × 12ft',
        baseline: {
            temperature: 95,
            shadecoverage: 5,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 0
        },
        vision: {
            temperature: 87,
            shadeCoverage: 65,
            airQuality: 'Good',
            waterRunoff: 30,
            vegetation: 85
        },
        description: 'High surface temperatures, minimal shade coverage, elevated air quality index'
    },
    'alley-2': {
        id: 'alley-2',
        name: 'Alley 2',
        theme: 'Sun',
        address: 'S Alvarado to S Lake St, Between 12th St & 13th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0515, lng: -118.2437 },
        dimensions: '140ft × 12ft',
        baseline: {
            temperature: 93,
            shadeCoverage: 8,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 2
        },
        vision: {
            temperature: 85,
            shadeCoverage: 60,
            airQuality: 'Good',
            waterRunoff: 35,
            vegetation: 80
        },
        description: 'Solar light, electricity generation, kinetic energy potential'
    },
    'alley-3': {
        id: 'alley-3',
        name: 'Alley 3',
        theme: 'Water',
        address: 'S Alvarado to S Lake St, Between 13th St & 14th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0508, lng: -118.2437 },
        dimensions: '155ft × 12ft',
        baseline: {
            temperature: 96,
            shadeCoverage: 3,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 0
        },
        vision: {
            temperature: 86,
            shadeCoverage: 68,
            airQuality: 'Good',
            waterRunoff: 25,
            vegetation: 90
        },
        description: 'Water-driven ecosystem, rain gardens, permeable surfaces'
    },
    'alley-4': {
        id: 'alley-4',
        name: 'Alley 4',
        theme: 'Universe',
        address: 'S Alvarado to S Lake St, Between 14th St & 15th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0501, lng: -118.2437 },
        dimensions: '148ft × 12ft',
        baseline: {
            temperature: 94,
            shadeCoverage: 6,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 1
        },
        vision: {
            temperature: 86,
            shadeCoverage: 62,
            airQuality: 'Good',
            waterRunoff: 32,
            vegetation: 82
        },
        description: 'Celestial themes, night sky visibility, astronomical art'
    },
    'alley-5': {
        id: 'alley-5',
        name: 'Alley 5',
        theme: 'Energy',
        address: 'S Alvarado to S Lake St, Between 15th St & 16th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0494, lng: -118.2437 },
        dimensions: '152ft × 12ft',
        baseline: {
            temperature: 95,
            shadeCoverage: 4,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 0
        },
        vision: {
            temperature: 87,
            shadeCoverage: 64,
            airQuality: 'Good',
            waterRunoff: 28,
            vegetation: 88
        },
        description: 'Renewable energy integration, sustainable power solutions'
    },
    'alley-6': {
        id: 'alley-6',
        name: 'Alley 6',
        theme: 'Sun',
        address: 'S Alvarado to S Lake St, Between 16th St & 17th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0487, lng: -118.2437 },
        dimensions: '145ft × 12ft',
        baseline: {
            temperature: 93,
            shadeCoverage: 7,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 1
        },
        vision: {
            temperature: 85,
            shadeCoverage: 61,
            airQuality: 'Good',
            waterRunoff: 33,
            vegetation: 81
        },
        description: 'Solar radiation management, daylight optimization'
    },
    'alley-7': {
        id: 'alley-7',
        name: 'Alley 7',
        theme: 'Water',
        address: 'S Alvarado to S Lake St, Between 17th St & 18th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0480, lng: -118.2437 },
        dimensions: '150ft × 12ft',
        baseline: {
            temperature: 96,
            shadeCoverage: 5,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 0
        },
        vision: {
            temperature: 88,
            shadeCoverage: 66,
            airQuality: 'Good',
            waterRunoff: 26,
            vegetation: 87
        },
        description: 'Stormwater management, aquatic biodiversity'
    },
    'alley-8': {
        id: 'alley-8',
        name: 'Alley 8',
        theme: 'Universe',
        address: 'S Alvarado to S Lake St, Between 18th St & 19th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0473, lng: -118.2437 },
        dimensions: '147ft × 12ft',
        baseline: {
            temperature: 94,
            shadeCoverage: 6,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 1
        },
        vision: {
            temperature: 86,
            shadeCoverage: 63,
            airQuality: 'Good',
            waterRunoff: 30,
            vegetation: 84
        },
        description: 'Community gathering space, cultural expression'
    },
    'alley-9': {
        id: 'alley-9',
        name: 'Alley 9',
        theme: 'Energy',
        address: 'S Alvarado to S Lake St, Between 19th St & 20th St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0466, lng: -118.2437 },
        dimensions: '151ft × 12ft',
        baseline: {
            temperature: 95,
            shadeCoverage: 5,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 0
        },
        vision: {
            temperature: 87,
            shadeCoverage: 65,
            airQuality: 'Good',
            waterRunoff: 29,
            vegetation: 86
        },
        description: 'Energy efficiency, smart infrastructure'
    },
    'alley-10': {
        id: 'alley-10',
        name: 'Alley 10',
        theme: 'Sun',
        address: 'S Alvarado to S Lake St, Between 20th St & 21st St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0459, lng: -118.2437 },
        dimensions: '146ft × 12ft',
        baseline: {
            temperature: 93,
            shadeCoverage: 7,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 2
        },
        vision: {
            temperature: 85,
            shadeCoverage: 62,
            airQuality: 'Good',
            waterRunoff: 31,
            vegetation: 83
        },
        description: 'Photosynthesis optimization, plant growth'
    },
    'alley-11': {
        id: 'alley-11',
        name: 'Alley 11',
        theme: 'Water',
        address: 'S Alvarado to S Lake St, Between 21st St & 22nd St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0452, lng: -118.2437 },
        dimensions: '149ft × 12ft',
        baseline: {
            temperature: 96,
            shadeCoverage: 4,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 0
        },
        vision: {
            temperature: 88,
            shadeCoverage: 67,
            airQuality: 'Good',
            waterRunoff: 27,
            vegetation: 89
        },
        description: 'Hydrological cycle restoration, wetland creation'
    },
    'alley-12': {
        id: 'alley-12',
        name: 'Alley 12',
        theme: 'Universe',
        address: 'S Alvarado to S Lake St, Between 22nd St & 23rd St',
        location: 'Pico-Union, Los Angeles',
        coordinates: { lat: 34.0445, lng: -118.2437 },
        dimensions: '150ft × 12ft',
        baseline: {
            temperature: 94,
            shadeCoverage: 6,
            airQuality: 'Poor',
            waterRunoff: 100,
            vegetation: 1
        },
        vision: {
            temperature: 86,
            shadeCoverage: 64,
            airQuality: 'Good',
            waterRunoff: 31,
            vegetation: 85
        },
        description: 'Biodiversity hub, ecological restoration'
    }
};

// Helper function to get alley by ID
function getAlleyById(alleyId) {
    return ALLEYS_DATA[alleyId] || ALLEYS_DATA['alley-1'];
}

// Helper function to get all alleys
function getAllAlleys() {
    return Object.values(ALLEYS_DATA);
}

// Helper function to get alleys by theme
function getAlleysByTheme(theme) {
    return Object.values(ALLEYS_DATA).filter(alley => alley.theme === theme);
}

// Helper function to get unique themes
function getUniqueThemes() {
    const themes = new Set();
    Object.values(ALLEYS_DATA).forEach(alley => themes.add(alley.theme));
    return Array.from(themes);
}

// Store selected alley in localStorage for persistence across pages
function setSelectedAlley(alleyId) {
    localStorage.setItem('selectedAlley', alleyId);
}

function getSelectedAlley() {
    return localStorage.getItem('selectedAlley') || 'alley-1';
}

// Get current alley data
function getCurrentAlley() {
    const alleyId = getSelectedAlley();
    return getAlleyById(alleyId);
}
