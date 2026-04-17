/**
 * UI UTILITIES FOR ALLEY BLOOM
 * Toast notifications, loading states, confirmations, validation
 */

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ⓘ'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        this.container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('toast-show'), 10);
        
        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.remove('toast-show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
        
        return toast;
    }

    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// Global toast instance
const toast = new ToastManager();

// ============================================================================
// LOADING STATE MANAGER
// ============================================================================

class LoadingManager {
    setLoading(element, isLoading, loadingText = 'Loading...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        if (isLoading) {
            element.disabled = true;
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = `<span class="spinner"></span> ${loadingText}`;
            element.classList.add('loading');
        } else {
            element.disabled = false;
            element.innerHTML = element.dataset.originalText || element.innerHTML;
            element.classList.remove('loading');
        }
    }

    showSpinner(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="spinner-large"></div>';
        }
    }

    showSkeleton(containerId, type = 'card') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const skeletons = {
            card: '<div class="skeleton-card"></div>',
            text: '<div class="skeleton-text"></div>',
            metric: '<div class="skeleton-metric"></div>'
        };
        
        container.innerHTML = skeletons[type] || skeletons.card;
    }
}

const loading = new LoadingManager();

// ============================================================================
// CONFIRMATION DIALOGS
// ============================================================================

class ConfirmDialog {
    show(options) {
        return new Promise((resolve) => {
            const {
                title = 'Are you sure?',
                message = '',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                type = 'warning'
            } = options;

            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            
            const dialog = document.createElement('div');
            dialog.className = `confirm-dialog confirm-${type}`;
            
            dialog.innerHTML = `
                <div class="confirm-header">
                    <h3>${title}</h3>
                </div>
                <div class="confirm-body">
                    <p>${message}</p>
                </div>
                <div class="confirm-footer">
                    <button class="btn-cancel">${cancelText}</button>
                    <button class="btn-confirm">${confirmText}</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            // Show animation
            setTimeout(() => {
                overlay.classList.add('show');
                dialog.classList.add('show');
            }, 10);
            
            // Handle buttons
            const btnCancel = dialog.querySelector('.btn-cancel');
            const btnConfirm = dialog.querySelector('.btn-confirm');
            
            const cleanup = () => {
                overlay.classList.remove('show');
                dialog.classList.remove('show');
                setTimeout(() => overlay.remove(), 300);
            };
            
            btnCancel.onclick = () => {
                cleanup();
                resolve(false);
            };
            
            btnConfirm.onclick = () => {
                cleanup();
                resolve(true);
            };
            
            // Close on overlay click
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            };
        });
    }

    async confirmDelete(itemName = 'this item') {
        return this.show({
            title: 'Delete Item',
            message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger'
        });
    }

    async confirmClear(description = 'all items') {
        return this.show({
            title: 'Clear Design',
            message: `This will remove ${description}. Are you sure?`,
            confirmText: 'Clear',
            type: 'warning'
        });
    }
}

const confirm = new ConfirmDialog();

// ============================================================================
// INPUT VALIDATION
// ============================================================================

const Validator = {
    // Validate export data
    validateExport(data) {
        const errors = [];
        
        if (!data.project_name || data.project_name.trim() === '') {
            errors.push('Project name is required');
        }
        
        if (!data.alley_id || data.alley_id === 'unknown') {
            errors.push('Please select an alley');
        }
        
        if (!data.murals || data.murals.length === 0) {
            errors.push('Add at least one mural before exporting');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Validate scenario data
    validateScenario(scenario) {
        const errors = [];
        
        if (!scenario.id || scenario.id.trim() === '') {
            errors.push('Scenario ID is required');
        }
        
        if (!scenario.name || scenario.name.trim() === '') {
            errors.push('Scenario name is required');
        }
        
        const validTypes = ['baseline', 'green', 'shade', 'water', 'art', 'vision'];
        if (!scenario.type || !validTypes.includes(scenario.type)) {
            errors.push(`Scenario type must be one of: ${validTypes.join(', ')}`);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Validate file upload
    validateFile(file, options = {}) {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
        } = options;
        
        const errors = [];
        
        if (!file) {
            errors.push('No file selected');
            return { valid: false, errors };
        }
        
        if (!allowedTypes.includes(file.type)) {
            errors.push(`Only ${allowedTypes.join(', ')} files are allowed`);
        }
        
        if (file.size > maxSize) {
            const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
            errors.push(`File size must be less than ${maxMB} MB`);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
};

// ============================================================================
// CONNECTION STATUS INDICATOR
// ============================================================================

class ConnectionStatus {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (this.container) {
            this.render('disconnected');
        }
    }

    render(status) {
        if (!this.container) return;
        
        const statusConfig = {
            connected: { icon: '🟢', text: 'Connected', class: 'status-connected' },
            disconnected: { icon: '🔴', text: 'Disconnected', class: 'status-disconnected' },
            reconnecting: { icon: '🟡', text: 'Reconnecting...', class: 'status-reconnecting' }
        };
        
        const config = statusConfig[status] || statusConfig.disconnected;
        
        this.container.innerHTML = `
            <span class="connection-status ${config.class}">
                <span class="status-icon">${config.icon}</span>
                <span class="status-text">${config.text}</span>
            </span>
        `;
    }

    setConnected() {
        this.render('connected');
    }

    setDisconnected() {
        this.render('disconnected');
    }

    setReconnecting() {
        this.render('reconnecting');
    }
}

// ============================================================================
// AUTO-SAVE MANAGER
// ============================================================================

class AutoSave {
    constructor(key, saveInterval = 5000) {
        this.storageKey = key;
        this.saveInterval = saveInterval;
        this.lastSaved = null;
        this.saveTimer = null;
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.lastSaved = new Date();
            return true;
        } catch (e) {
            console.error('Auto-save failed:', e);
            return false;
        }
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Auto-load failed:', e);
            return null;
        }
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }

    startAutoSave(getDataFn) {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
        }
        
        this.saveTimer = setInterval(() => {
            const data = getDataFn();
            if (data && this.save(data)) {
                console.log('Auto-saved at', new Date().toLocaleTimeString());
            }
        }, this.saveInterval);
    }

    stopAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
    }

    async promptRestore() {
        const saved = this.load();
        if (!saved) return null;
        
        const restore = await confirm.show({
            title: 'Restore Previous Work?',
            message: 'We found auto-saved work from your last session. Would you like to restore it?',
            confirmText: 'Restore',
            cancelText: 'Start Fresh',
            type: 'info'
        });
        
        return restore ? saved : null;
    }
}

// ============================================================================
// UNDO/REDO MANAGER
// ============================================================================

class UndoRedoManager {
    constructor(maxHistory = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = maxHistory;
    }

    push(state) {
        // Remove any states after current index
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Add new state
        this.history.push(JSON.parse(JSON.stringify(state)));
        this.currentIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
        
        this.updateButtons();
    }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            this.updateButtons();
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            this.updateButtons();
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.updateButtons();
    }

    updateButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
        }
        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
        }
    }
}

// ============================================================================
// EXPORT TO WINDOW
// ============================================================================

window.toast = toast;
window.loading = loading;
window.confirm = confirm;
window.Validator = Validator;
window.ConnectionStatus = ConnectionStatus;
window.AutoSave = AutoSave;
window.UndoRedoManager = UndoRedoManager;
