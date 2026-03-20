// Enhanced Scenarios Functionality
// Handles: Create Scenario, Generate Sample Data, Compare, Export, Display Scenarios

// Store scenarios in localStorage
function getScenariosFromStorage() {
    const stored = localStorage.getItem('scenarios');
    return stored ? JSON.parse(stored) : [];
}

function saveScenariosToStorage(scenarios) {
    localStorage.setItem('scenarios', JSON.stringify(scenarios));
}

// Create a new scenario
function createScenario(name, alleyId, designType, description) {
    const scenarios = getScenariosFromStorage();
    const alley = getAlleyById(alleyId);
    
    const newScenario = {
        id: 'scenario-' + Date.now(),
        name: name,
        alleyId: alleyId,
        alleyName: alley.name,
        alleyAddress: alley.address,
        designType: designType,
        description: description,
        createdAt: new Date().toISOString(),
        baseline: alley.baseline,
        vision: alley.vision,
        improvements: {
            temperature: alley.baseline.temperature - alley.vision.temperature,
            shade: alley.vision.shadeCoverage - alley.baseline.shadecoverage,
            vegetation: alley.vision.vegetation - alley.baseline.vegetation
        }
    };
    
    scenarios.push(newScenario);
    saveScenariosToStorage(scenarios);
    return newScenario;
}

// Generate sample data for demo
function generateSampleData() {
    const alleys = getAllAlleys();
    const designTypes = ['Rain Gardens', 'Tree Canopy', 'Permeable Paving', 'Green Wall', 'Solar Shade'];
    
    alleys.forEach((alley, index) => {
        const designType = designTypes[index % designTypes.length];
        createScenario(
            `${alley.name} - ${designType}`,
            alley.id,
            designType,
            `Design concept focusing on ${designType.toLowerCase()} for ${alley.name}`
        );
    });
    
    displayScenarios();
    updateScenarioCount();
}

// Display all scenarios in grid
function displayScenarios() {
    const grid = document.getElementById('scenariosGrid');
    const scenarios = getScenariosFromStorage();
    
    if (!grid) return;
    
    if (scenarios.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🎨</div>
                <h3 style="color: var(--text-primary); font-size: 1.5rem; margin-bottom: 10px;">No Scenarios Yet</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Create your first design scenario to get started</p>
                <button onclick="openCreateModal()" style="padding: 10px 20px; background: var(--highlight); color: var(--primary); border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Create First Scenario</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = scenarios.map(scenario => `
        <div class="scenario-card">
            <div class="scenario-header">
                <div>
                    <h3 class="scenario-title">${scenario.name}</h3>
                    <span class="scenario-status" style="background: rgba(15, 164, 175, 0.2); color: var(--highlight);">${scenario.designType}</span>
                </div>
            </div>
            
            <div class="scenario-meta" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                <div>
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">Location</span>
                    <div style="color: var(--text-primary); font-weight: 500;">${scenario.alleyName}</div>
                </div>
                <div>
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">Created</span>
                    <div style="color: var(--text-primary); font-weight: 500;">${new Date(scenario.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
            
            <div style="background: rgba(15, 164, 175, 0.1); padding: 12px; border-radius: 6px; margin: 15px 0;">
                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 8px;">Impact Metrics</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--highlight); font-weight: 700;">-${scenario.improvements.temperature}°F</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Temperature</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--highlight); font-weight: 700;">+${scenario.improvements.shade}%</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Shade</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--highlight); font-weight: 700;">+${scenario.improvements.vegetation}%</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Vegetation</div>
                    </div>
                </div>
            </div>
            
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 15px 0; line-height: 1.5;">${scenario.description}</p>
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="editScenario('${scenario.id}')" style="flex: 1; padding: 8px; background: var(--secondary); color: var(--text-primary); border: 1px solid var(--highlight); border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    ✏️ Edit
                </button>
                <button onclick="deleteScenario('${scenario.id}')" style="flex: 1; padding: 8px; background: rgba(244, 67, 54, 0.1); color: #F44336; border: 1px solid rgba(244, 67, 54, 0.3); border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    🗑️ Delete
                </button>
                <button onclick="viewInDesignStudio('${scenario.id}')" style="flex: 1; padding: 8px; background: var(--highlight); color: var(--primary); border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    🎨 Design
                </button>
            </div>
        </div>
    `).join('');
}

// Delete scenario
function deleteScenario(scenarioId) {
    if (confirm('Delete this scenario?')) {
        let scenarios = getScenariosFromStorage();
        scenarios = scenarios.filter(s => s.id !== scenarioId);
        saveScenariosToStorage(scenarios);
        displayScenarios();
        updateScenarioCount();
    }
}

// Edit scenario (navigate to design studio)
function editScenario(scenarioId) {
    localStorage.setItem('editingScenarioId', scenarioId);
    window.location.href = '/design-workspace';
}

// View in Design Studio
function viewInDesignStudio(scenarioId) {
    localStorage.setItem('editingScenarioId', scenarioId);
    window.location.href = '/design-workspace';
}

// Update scenario count
function updateScenarioCount() {
    const scenarios = getScenariosFromStorage();
    const countEl = document.getElementById('scenarioCount');
    if (countEl) {
        countEl.textContent = `${scenarios.length} Active Scenario${scenarios.length !== 1 ? 's' : ''}`;
    }
}

// Export scenarios as CSV
function exportScenarios() {
    const scenarios = getScenariosFromStorage();
    
    if (scenarios.length === 0) {
        alert('No scenarios to export');
        return;
    }
    
    let csv = 'Scenario Name,Alley,Design Type,Temperature Reduction,Shade Improvement,Vegetation Increase,Created Date\n';
    
    scenarios.forEach(scenario => {
        csv += `"${scenario.name}","${scenario.alleyName}","${scenario.designType}","-${scenario.improvements.temperature}°F","+${scenario.improvements.shade}%","+${scenario.improvements.vegetation}%","${new Date(scenario.createdAt).toLocaleDateString()}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alley-bloom-scenarios-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Open Create Scenario Modal
function openCreateModal() {
    const currentAlley = getCurrentAlley();
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Create Design Scenario</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
            </div>
            
            <div style="padding: var(--spacing-lg) 0;">
                <div class="form-group">
                    <label class="form-label">Alley</label>
                    <select id="scenarioAlley" class="form-select" style="width: 100%; padding: 8px; background: rgba(2, 73, 80, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: var(--text-primary);">
                        ${getAllAlleys().map(alley => `
                            <option value="${alley.id}" ${alley.id === currentAlley.id ? 'selected' : ''}>${alley.name} - ${alley.address}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Design Type</label>
                    <select id="designType" class="form-select" style="width: 100%; padding: 8px; background: rgba(2, 73, 80, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: var(--text-primary);">
                        <option value="Rain Gardens">Rain Gardens</option>
                        <option value="Tree Canopy">Tree Canopy</option>
                        <option value="Permeable Paving">Permeable Paving</option>
                        <option value="Green Wall">Green Wall</option>
                        <option value="Solar Shade">Solar Shade</option>
                        <option value="Mixed Design">Mixed Design</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Scenario Name</label>
                    <input type="text" id="scenarioName" class="form-input" placeholder="e.g., Alley 1 - Rain Garden Concept" style="width: 100%; padding: 8px; background: rgba(2, 73, 80, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: var(--text-primary);">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="scenarioDescription" class="form-textarea" placeholder="Describe your design concept..." style="width: 100%; padding: 8px; background: rgba(2, 73, 80, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: var(--text-primary); min-height: 100px;"></textarea>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="this.closest('.modal').remove()" style="flex: 1; padding: 10px; background: var(--secondary); color: var(--text-primary); border: 1px solid rgba(15, 164, 175, 0.3); border-radius: 4px; cursor: pointer; font-weight: 600;">Cancel</button>
                <button onclick="saveNewScenario()" style="flex: 1; padding: 10px; background: var(--highlight); color: var(--primary); border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Save & Compare</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Save new scenario
function saveNewScenario() {
    const alleyId = document.getElementById('scenarioAlley').value;
    const designType = document.getElementById('designType').value;
    const name = document.getElementById('scenarioName').value;
    const description = document.getElementById('scenarioDescription').value;
    
    if (!name.trim()) {
        alert('Please enter a scenario name');
        return;
    }
    
    createScenario(name, alleyId, designType, description);
    document.querySelector('.modal').remove();
    displayScenarios();
    updateScenarioCount();
    alert('Scenario created! You can now edit it in the Design Studio.');
}

// Toggle compare mode
function toggleCompareMode() {
    const scenarios = getScenariosFromStorage();
    if (scenarios.length < 2) {
        alert('Create at least 2 scenarios to compare');
        return;
    }
    alert('Compare mode: Select 2 scenarios to compare side-by-side');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayScenarios();
    updateScenarioCount();
});
