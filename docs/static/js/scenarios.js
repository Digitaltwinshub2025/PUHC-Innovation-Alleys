/**
 * Scenarios Page - Load and display real data from API
 */

// Load scenarios when page loads
document.addEventListener('DOMContentLoaded', (evt) => {
    loadScenarios();
});

/**
 * Load all scenarios from API
 */
async function loadScenarios() {
    try {
        const response = await fetch('/api/scenarios');
        const data = await response.json();
        
        if (data.scenarios && data.scenarios.length > 0) {
            renderScenarios(data.scenarios);
        } else {
            showNoScenariosMessage();
        }
    } catch (error) {
        console.error('Error loading scenarios:', error);
        showErrorMessage('Failed to load scenarios. Please refresh the page.');
    }
}

/**
 * Render scenarios to the grid
 */
function renderScenarios(scenarios) {
    const grid = document.getElementById('scenariosGrid');
    grid.innerHTML = ''; // Clear existing content
    
    // Store scenarios globally for compare feature
    window.allScenarios = scenarios;
    
    scenarios.forEach(scenario => {
        const card = createScenarioCard(scenario);
        grid.appendChild(card);
    });
}

/**
 * Create a scenario card element
 */
function createScenarioCard(scenario) {
    const card = document.createElement('div');
    card.className = 'scenario-card';
    card.dataset.scenarioId = scenario.id;  // Add ID for compare feature
    
    // Determine status class
    const statusClass = scenario.type === 'baseline' ? 'status-baseline' : 
                       scenario.type === 'vision' ? 'status-vision' : 'status-hybrid';
    
    // Format environmental data
    const envData = scenario.environmental_data || {};
    
    card.innerHTML = `
        <div class="scenario-header">
            <div>
                <h3 class="scenario-title">${scenario.name}</h3>
                <span class="scenario-status ${statusClass}">${capitalizeFirst(scenario.type)}</span>
            </div>
        </div>

        <div class="scenario-meta">
            <div class="meta-item">
                <span class="meta-label">Location</span>
                <span class="meta-value">${scenario.location?.name || 'N/A'}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Last Updated</span>
                <span class="meta-value">${formatDate(scenario.last_updated)}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Dimensions</span>
                <span class="meta-value">${formatDimensions(scenario.dimensions)}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Phase</span>
                <span class="meta-value">${scenario.phase || 'N/A'}</span>
            </div>
        </div>

        ${scenario.location?.address ? `
        <div class="scenario-address">
            <span class="meta-label">Address</span>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 4px 0 0 0;">
                ${scenario.location.address}
            </p>
        </div>
        ` : ''}

        <div class="scenario-layers">
            <div class="layers-title">Active Layers</div>
            <div class="layer-tags">
                ${(scenario.layers || []).map(layer => 
                    `<span class="layer-tag">${layer}</span>`
                ).join('')}
            </div>
        </div>

        <div class="environmental-data">
            <div class="env-title">${getEnvTitle(scenario.type)}</div>
            <div class="env-metrics">
                ${renderEnvironmentalMetrics(envData, scenario.type)}
            </div>
        </div>

        <div class="scenario-actions">
            <button class="action-btn btn-secondary" onclick="deleteScenario('${scenario.id}')" style="background: #F44336; border-color: #F44336;">Delete</button>
            <a href="/design-workspace?scenario=${scenario.id}" class="action-btn btn-secondary">Edit Design</a>
            <a href="/unreal-viewer?scenario=${scenario.id}" class="action-btn btn-primary">View in 3D</a>
        </div>
    `;
    
    return card;
}

/**
 * Delete a scenario
 */
async function deleteScenario(scenarioId) {
    if (!confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/scenarios/${scenarioId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Show success notification
            if (window.showNotification) {
                window.showNotification('Success', 'Scenario deleted successfully', 'success');
            }
            // Reload scenarios
            loadScenarios();
        } else {
            throw new Error('Failed to delete scenario');
        }
    } catch (error) {
        console.error('Error deleting scenario:', error);
        if (window.showNotification) {
            window.showNotification('Error', 'Failed to delete scenario. Please try again.', 'error');
        } else {
            alert('Failed to delete scenario. Please try again.');
        }
    }
}

/**
 * Render environmental metrics
 */
function renderEnvironmentalMetrics(envData, type) {
    const metrics = [];
    
    // Helper to get value from either object or direct number
    const getValue = (field) => {
        if (!field) return null;
        return typeof field === 'object' ? field.value : field;
    };
    
    const getUnit = (field, defaultUnit) => {
        if (!field) return defaultUnit;
        return typeof field === 'object' ? (field.unit || defaultUnit) : defaultUnit;
    };
    
    const getChange = (field) => {
        if (!field || typeof field !== 'object') return null;
        return field.change;
    };
    
    // Temperature
    if (envData.temperature !== undefined) {
        const tempVal = getValue(envData.temperature);
        const tempUnit = getUnit(envData.temperature, '°F');
        const tempChange = getChange(envData.temperature);
        
        metrics.push(`
            <div class="env-metric">
                <span class="env-metric-label">Temperature</span>
                <span class="env-metric-value">${tempVal}${tempUnit}</span>
                ${tempChange ? 
                    `<span class="env-metric-change ${tempChange < 0 ? 'change-positive' : 'change-negative'}">
                        ${tempChange > 0 ? '↑' : '↓'} ${Math.abs(tempChange)}°F ${tempChange < 0 ? 'reduction' : 'increase'}
                    </span>` : ''}
            </div>
        `);
    }
    
    // Air Quality
    if (envData.air_quality !== undefined) {
        const aqiVal = getValue(envData.air_quality);
        metrics.push(`
            <div class="env-metric">
                <span class="env-metric-label">Air Quality (AQI)</span>
                <span class="env-metric-value">${aqiVal}</span>
            </div>
        `);
    }
    
    // Water capture or runoff
    if (envData.water_capture !== undefined) {
        const captureVal = getValue(envData.water_capture);
        const captureUnit = getUnit(envData.water_capture, 'gal/mo');
        const captureChange = getChange(envData.water_capture);
        
        metrics.push(`
            <div class="env-metric">
                <span class="env-metric-label">Water Capture</span>
                <span class="env-metric-value">${captureVal} ${captureUnit}</span>
                ${captureChange ? 
                    `<span class="env-metric-change change-positive">↑ ${captureChange} gal captured</span>` : ''}
            </div>
        `);
    } else if (envData.water_runoff !== undefined) {
        const runoffVal = getValue(envData.water_runoff);
        const runoffUnit = getUnit(envData.water_runoff, '%');
        
        metrics.push(`
            <div class="env-metric">
                <span class="env-metric-label">Water Runoff</span>
                <span class="env-metric-value">${runoffVal}${runoffUnit}</span>
            </div>
        `);
    }
    
    // Shade coverage
    if (envData.shade_coverage !== undefined) {
        const shadeVal = getValue(envData.shade_coverage);
        const shadeUnit = getUnit(envData.shade_coverage, '%');
        const shadeChange = getChange(envData.shade_coverage);
        
        metrics.push(`
            <div class="env-metric">
                <span class="env-metric-label">Shade Coverage</span>
                <span class="env-metric-value">${shadeVal}${shadeUnit}</span>
                ${shadeChange ? 
                    `<span class="env-metric-change change-positive">↑ ${shadeChange}% increase</span>` : ''}
            </div>
        `);
    }
    
    // Green space
    if (envData.green_space !== undefined && type === 'vision') {
        const greenVal = getValue(envData.green_space);
        metrics.push(`
            <div class="env-metric">
                <span class="env-metric-label">Green Space</span>
                <span class="env-metric-value">${greenVal}%</span>
            </div>
        `);
    }
    
    // Biodiversity
    if (envData.biodiversity) {
        metrics.push(`
            <div class="env-metric">
                <span class="env-metric-label">Biodiversity</span>
                <span class="env-metric-value">${envData.biodiversity.level || 'N/A'}</span>
                ${envData.biodiversity.species_count > 0 ? 
                    `<span class="env-metric-change change-positive">↑ ${envData.biodiversity.species_count} native species</span>` : ''}
            </div>
        `);
    }
    
    // Data source badge
    if (envData.data_source) {
        metrics.push(`
            <div class="env-metric" style="grid-column: 1/-1; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(175, 221, 229, 0.2);">
                <span style="font-size: 0.75rem; color: var(--text-tertiary);">📊 Data: ${envData.data_source}</span>
            </div>
        `);
    }
    
    return metrics.join('');
}

/**
 * Get environmental section title based on scenario type
 */
function getEnvTitle(type) {
    switch(type) {
        case 'baseline':
            return 'Environmental Baseline';
        case 'vision':
            return 'Environmental Impact';
        default:
            return 'Environmental Data';
    }
}

/**
 * Format dimensions
 */
function formatDimensions(dimensions) {
    if (!dimensions) return 'N/A';
    return `${dimensions.length}${dimensions.unit} × ${dimensions.width}${dimensions.unit}`;
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Show no scenarios message
 */
function showNoScenariosMessage() {
    const grid = document.getElementById('scenariosGrid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <h3 style="color: var(--text-primary); margin-bottom: 16px;">No Scenarios Yet</h3>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">
                Create your first scenario to get started with alley transformation planning.
            </p>
            <button class="create-scenario-btn" onclick="openCreateModal()">
                + Create First Scenario
            </button>
        </div>
    `;
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const grid = document.getElementById('scenariosGrid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <h3 style="color: #F44336; margin-bottom: 16px;">Error Loading Scenarios</h3>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">${message}</p>
            <button class="create-scenario-btn" onclick="location.reload()">
                Refresh Page
            </button>
        </div>
    `;
}

// Export for use in other scripts
window.scenariosAPI = {
    loadScenarios,
    renderScenarios
};

// Export deleteScenario globally
window.deleteScenario = deleteScenario;
