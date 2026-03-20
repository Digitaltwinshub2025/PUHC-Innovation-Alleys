// Initialize Socket.IO connection
const socket = io();

// Get alley ID from canvas
const canvas = document.getElementById('canvas');
const alleyId = canvas ? canvas.dataset.alleyId : null;
const itemsContainer = document.getElementById('itemsContainer');

// State management
let placedItems = [];
let selectedItem = null;
let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let zoomLevel = 1;

// Export design data for immersive viewer
function exportDesignData() {
    const designData = {
        alleyId: alleyId,
        items: placedItems.map(item => ({
            id: item.id,
            type: item.type,
            subtype: item.subtype,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            rotation: item.rotation || 0,
            blendMode: item.blendMode || 'normal',
            opacity: item.opacity || 1,
            customImage: item.customImage
        })),
        canvasSize: {
            width: canvas ? canvas.offsetWidth : 0,
            height: canvas ? canvas.offsetHeight : 0
        },
        timestamp: Date.now()
    };
    
    // Store in localStorage for immersive viewer to access
    localStorage.setItem('alleyDesignData', JSON.stringify(designData));
    console.log('Design data exported:', designData);
    
    return designData;
}

// Launch immersive viewer with current design
window.launchImmersiveViewer = function() {
    exportDesignData();
    showNotification('🚀 Launching immersive viewer...');
    
    // Open immersive viewer in new tab
    window.open('/workspace3d?alley=' + alleyId, '_blank');
};

// Select item function
function selectItem(item) {
    // Deselect all items first
    document.querySelectorAll('.placed-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select this item
    const itemElement = document.getElementById(`item-${item.id}`);
    if (itemElement) {
        itemElement.classList.add('selected');
        selectedItem = item;
        showNotification(`✓ Selected ${item.type} - Use Blend Mode button or right-click`);
    }
}

// Apply blend mode to all selected items (called from blend panel)
window.applyBlendModeToSelected = function(mode) {
    const selectedItems = document.querySelectorAll('.placed-item.selected');
    if (selectedItems.length > 0) {
        selectedItems.forEach(element => {
            const itemId = element.id.replace('item-', '');
            const item = placedItems.find(i => i.id === itemId);
            if (item) {
                setBlendMode(item, mode);
            }
        });
        return true;
    }
    return false;
};

// Item type configurations
const itemConfigs = {
    'art': {
        'mural-1': { emoji: '🎨', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', size: { w: 400, h: 300 } },
        'mural-2': { emoji: '🖼️', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', size: { w: 400, h: 300 } },
        'mural-3': { emoji: '🎨', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', size: { w: 400, h: 300 } },
        'mural-4': { emoji: '🖼️', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', size: { w: 400, h: 300 } },
        'mural-5': { emoji: '🎨', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', size: { w: 400, h: 300 } },
        'mural-6': { emoji: '🖼️', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', size: { w: 400, h: 300 } },
        'sculpture': { emoji: '🗿', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', size: { w: 100, h: 150 } },
        'graffiti': { emoji: '✨', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', size: { w: 120, h: 180 } }
    },
    'plant': {
        'tree': { emoji: '🌳', bg: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)', size: { w: 120, h: 180 } },
        'flowers': { emoji: '🌸', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', size: { w: 80, h: 100 } },
        'vertical-garden': { emoji: '🌿', bg: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', size: { w: 100, h: 200 } },
        'shrubs': { emoji: '🪴', bg: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', size: { w: 90, h: 90 } },
        'vines': { emoji: '🍃', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', size: { w: 80, h: 150 } }
    },
    'furniture': {
        'bench': { emoji: '🪑', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', size: { w: 120, h: 80 } },
        'lights': { emoji: '💡', bg: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)', size: { w: 200, h: 50 } },
        'bike-rack': { emoji: '🚲', bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', size: { w: 100, h: 80 } }
    }
};

// Socket.IO event handlers
if (alleyId) {
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('join_alley', { alley_id: alleyId });
    });

    socket.on('load_design', (data) => {
        console.log('Loading existing design', data);
        placedItems = data.items || [];
        renderAllItems();
    });

    socket.on('item_added', (data) => {
        console.log('Item added by another user', data);
        placedItems.push(data.item);
        renderItem(data.item);
    });

    socket.on('item_updated', (data) => {
        console.log('Item updated by another user', data);
        const index = placedItems.findIndex(item => item.id === data.item.id);
        if (index !== -1) {
            placedItems[index] = data.item;
            updateItemElement(data.item);
        }
    });

    socket.on('item_removed', (data) => {
        console.log('Item removed by another user', data);
        placedItems = placedItems.filter(item => item.id !== data.item_id);
        const element = document.getElementById(`item-${data.item_id}`);
        if (element) {
            element.remove();
        }
    });

    socket.on('design_cleared', () => {
        console.log('Design cleared by another user');
        placedItems = [];
        itemsContainer.innerHTML = '';
    });

    socket.on('user_joined', (data) => {
        console.log(data.message);
        showNotification('👋 A neighbor joined the design space');
    });
    socket.on('user_left', (data) => {
        console.log(data.message);
    });
}

// Initialize drag and drop
function initializeDragAndDrop() {
    console.log('Initializing drag and drop...');
    
    // Draggable items (both sidebar and carousel)
    const draggableItems = document.querySelectorAll('.draggable-item, .asset-thumb');
    console.log(`Found ${draggableItems.length} draggable items`);
    
    draggableItems.forEach(item => {
        // Ensure draggable attribute is set
        item.setAttribute('draggable', 'true');
        item.style.cursor = 'grab';
        
        item.addEventListener('dragstart', (e) => {
            console.log('Drag started:', item.dataset.type, item.dataset.subtype);
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('type', item.dataset.type);
            e.dataTransfer.setData('subtype', item.dataset.subtype);
            item.style.opacity = '0.5';
            item.style.cursor = 'grabbing';
            
            // Add drag-active class to canvas
            if (canvas) {
                canvas.classList.add('drag-active');
            }
        });
        
        item.addEventListener('dragend', (e) => {
            console.log('Drag ended');
            item.style.opacity = '1';
            item.style.cursor = 'grab';
            
            // Remove drag-active class from canvas
            if (canvas) {
                canvas.classList.remove('drag-active');
            }
        });
    });
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDragAndDrop);
} else {
    initializeDragAndDrop();
}

// Canvas drop zone
if (canvas) {
    console.log('Canvas found, setting up drop zone');
    
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        canvas.classList.add('drag-active');
    });
    
    canvas.addEventListener('dragleave', (e) => {
        // Only remove if we're actually leaving the canvas
        if (e.target === canvas) {
            canvas.classList.remove('drag-active');
        }
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('Drop event triggered');
        
        const type = e.dataTransfer.getData('type');
        const subtype = e.dataTransfer.getData('subtype');
        
        console.log('Dropped item:', type, subtype);
        
        if (type && subtype) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left + canvas.scrollLeft;
            const y = e.clientY - rect.top + canvas.scrollTop;
            
            console.log('Drop position:', x, y);
            
            addItem(type, subtype, x, y);
            
            // Show hint notification
            showHint('✨ Nice! Click to select, drag to move, right-click for options.');
        } else {
            console.error('No type or subtype data in drop event');
        }
        
        // Remove drag-active class
        canvas.classList.remove('drag-active');
    });
} else {
    console.error('Canvas element not found!');
}

// Add item to canvas
function addItem(type, subtype, x, y, width, height, customImage) {
    const config = itemConfigs[type] && itemConfigs[type][subtype] ? itemConfigs[type][subtype] : { size: { w: width || 200, h: height || 200 }, bg: 'transparent', emoji: '' };
    const item = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        subtype: subtype,
        x: x,
        y: y,
        width: width || config.size.w,
        height: height || config.size.h,
        zIndex: placedItems.length,
        customImage: customImage || null
    };
    
    placedItems.push(item);
    renderItem(item);
    
    // Emit to other users
    socket.emit('add_item', {
        alley_id: alleyId,
        item: item
    });
}

// Render a single item
function renderItem(item) {
    const config = itemConfigs[item.type] && itemConfigs[item.type][item.subtype] ? itemConfigs[item.type][item.subtype] : { bg: 'transparent', emoji: '' };
    
    const itemElement = document.createElement('div');
    itemElement.id = `item-${item.id}`;
    itemElement.className = 'placed-item';
    
    // Apply blend mode if set, otherwise default to multiply for art
    if (item.blendMode) {
        itemElement.classList.add(`blend-${item.blendMode}`);
    } else if (item.type === 'art') {
        itemElement.classList.add('blend-multiply'); // Default blend mode for art
    }
    
    itemElement.setAttribute('data-type', item.type);
    itemElement.setAttribute('data-subtype', item.subtype);
    itemElement.style.left = `${item.x}px`;
    itemElement.style.top = `${item.y}px`;
    itemElement.style.width = `${item.width}px`;
    itemElement.style.height = `${item.height}px`;
    itemElement.style.zIndex = item.zIndex;
    
    // Check if custom image or if it's an art type with actual image
    const itemOpacity = item.opacity !== undefined ? (item.opacity / 100).toFixed(2) : '0.85';
    let contentHTML;
    if (item.customImage) {
        contentHTML = `
            <div class="item-content" style="background: transparent; opacity: ${itemOpacity};">
                <img src="${item.customImage}" alt="Custom artwork" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
        `;
    } else if (item.type === 'art' && item.subtype.startsWith('mural-')) {
        // Use actual mural images from artwork folder
        contentHTML = `
            <div class="item-content" style="background: transparent; opacity: ${itemOpacity};">
                <img src="/static/images/artwork/${item.subtype}.jpg" alt="${item.subtype}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
        `;
    } else {
        contentHTML = `
            <div class="item-content" style="background: ${config.bg}; opacity: ${itemOpacity};">
                ${config.emoji}
            </div>
        `;
    }
    
    itemElement.innerHTML = `
        ${contentHTML}
        <div class="resize-handle-se"></div>
        <div class="resize-handle-nw"></div>
        <div class="resize-handle-ne"></div>
        <div class="resize-handle-sw"></div>
        <div class="resize-handle-n"></div>
        <div class="resize-handle-s"></div>
        <div class="resize-handle-e"></div>
        <div class="resize-handle-w"></div>
        <div class="rotate-handle"></div>
    `;
    
    // Make item draggable and selectable
    itemElement.addEventListener('mousedown', startDrag);
    
    // Click to select (without dragging)
    itemElement.addEventListener('click', (e) => {
        if (!isDragging && !isResizing) {
            selectItem(item);
        }
    });
    
    // Resize handles - all 8 directions
    const resizeHandles = itemElement.querySelectorAll('[class^="resize-handle-"]');
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', startResize);
    });
    
    // Right-click context menu
    itemElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, item);
    });
    
    itemsContainer.appendChild(itemElement);
}

// Render all items
function renderAllItems() {
    itemsContainer.innerHTML = '';
    placedItems.forEach(item => renderItem(item));
}

// Update existing item element
function updateItemElement(item) {
    const element = document.getElementById(`item-${item.id}`);
    if (element) {
        element.style.left = `${item.x}px`;
        element.style.top = `${item.y}px`;
        element.style.width = `${item.width}px`;
        element.style.height = `${item.height}px`;
        element.style.zIndex = item.zIndex;
    }
}

// Drag functionality
function startDrag(e) {
    // Don't drag if clicking on resize or rotate handles
    if (e.target.className && e.target.className.includes('resize-handle')) return;
    if (e.target.classList.contains('rotate-handle')) return;
    
    isDragging = true;
    const itemElement = e.currentTarget;
    const itemId = itemElement.id.replace('item-', '');
    selectedItem = placedItems.find(item => item.id === itemId);
    
    if (selectedItem) {
        const rect = itemElement.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        
        itemElement.classList.add('selected', 'dragging');
        document.body.style.cursor = 'grabbing';
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }
}

function drag(e) {
    if (!isDragging || !selectedItem) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x + canvas.scrollLeft;
    const y = e.clientY - canvasRect.top - dragOffset.y + canvas.scrollTop;
    
    selectedItem.x = Math.max(0, x);
    selectedItem.y = Math.max(0, y);
    
    updateItemElement(selectedItem);
}

function stopDrag() {
    if (isDragging && selectedItem) {
        isDragging = false;
        
        // Emit update to other users
        socket.emit('update_item', {
            alley_id: alleyId,
            item: selectedItem
        });
        
        const itemElement = document.getElementById(`item-${selectedItem.id}`);
        if (itemElement) {
            itemElement.classList.remove('selected', 'dragging');
        }
        document.body.style.cursor = '';
    }
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

// Resize functionality
function startResize(e) {
    e.stopPropagation();
    e.preventDefault();
    isResizing = true;
    
    const itemElement = e.target.closest('.placed-item');
    const itemId = itemElement.id.replace('item-', '');
    selectedItem = placedItems.find(item => item.id === itemId);
    
    // Add visual feedback
    itemElement.classList.add('resizing');
    document.body.style.cursor = 'nwse-resize';
    
    // Show helpful tip
    showHint('💡 Drag to resize. Release to finish.');
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

function resize(e) {
    if (!isResizing || !selectedItem) return;
    
    const itemElement = document.getElementById(`item-${selectedItem.id}`);
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas
    const mouseX = e.clientX - canvasRect.left + canvas.scrollLeft;
    const mouseY = e.clientY - canvasRect.top + canvas.scrollTop;
    
    // Calculate new dimensions from item position
    const newWidth = mouseX - selectedItem.x;
    const newHeight = mouseY - selectedItem.y;
    
    // Set minimum size and update
    selectedItem.width = Math.max(50, newWidth);
    selectedItem.height = Math.max(50, newHeight);
    
    updateItemElement(selectedItem);
}

function stopResize() {
    if (isResizing && selectedItem) {
        isResizing = false;
        
        // Remove visual feedback
        const itemElement = document.getElementById(`item-${selectedItem.id}`);
        if (itemElement) {
            itemElement.classList.remove('resizing');
        }
        document.body.style.cursor = '';
        
        // Emit update to other users
        socket.emit('update_item', {
            alley_id: alleyId,
            item: selectedItem
        });
    }
    
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

// Context menu
function showContextMenu(e, item) {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    
    // Delete button
    document.getElementById('deleteItem').onclick = () => {
        deleteItem(item.id);
        contextMenu.style.display = 'none';
    };
    
    // Bring forward
    document.getElementById('bringForward').onclick = () => {
        item.zIndex = Math.max(...placedItems.map(i => i.zIndex)) + 1;
        updateItemElement(item);
        socket.emit('update_item', { alley_id: alleyId, item: item });
        contextMenu.style.display = 'none';
    };
    
    // Send backward
    document.getElementById('sendBackward').onclick = () => {
        item.zIndex = Math.max(0, item.zIndex - 1);
        updateItemElement(item);
        socket.emit('update_item', { alley_id: alleyId, item: item });
        contextMenu.style.display = 'none';
    };
    
    // Blend mode buttons
    document.getElementById('blendMultiply').onclick = () => {
        setBlendMode(item, 'multiply');
        contextMenu.style.display = 'none';
    };
    
    document.getElementById('blendOverlay').onclick = () => {
        setBlendMode(item, 'overlay');
        contextMenu.style.display = 'none';
    };
    
    document.getElementById('blendScreen').onclick = () => {
        setBlendMode(item, 'screen');
        contextMenu.style.display = 'none';
    };
    
    document.getElementById('blendSoftLight').onclick = () => {
        setBlendMode(item, 'soft-light');
        contextMenu.style.display = 'none';
    };
    
    // Opacity slider
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    
    // Set current opacity
    const currentOpacity = item.opacity !== undefined ? item.opacity : 85;
    opacitySlider.value = currentOpacity;
    opacityValue.textContent = `${currentOpacity}%`;
    
    // Handle opacity changes
    opacitySlider.oninput = (e) => {
        const opacity = parseInt(e.target.value);
        opacityValue.textContent = `${opacity}%`;
        setItemOpacity(item, opacity);
    };
}

// Set blend mode for an item
function setBlendMode(item, mode) {
    console.log('Setting blend mode:', mode, 'for item:', item.id);
    item.blendMode = mode;
    const element = document.getElementById(`item-${item.id}`);
    if (element) {
        // Remove all blend mode classes
        element.classList.remove('blend-multiply', 'blend-overlay', 'blend-screen', 'blend-soft-light');
        // Add new blend mode class
        element.classList.add(`blend-${mode}`);
        console.log('Applied class:', `blend-${mode}`, 'Classes now:', element.className);
        
        // Force a visual refresh
        element.style.opacity = '0.99';
        setTimeout(() => {
            element.style.opacity = '';
        }, 10);
    } else {
        console.error('Element not found:', `item-${item.id}`);
    }
    // Sync with other users
    socket.emit('update_item', { alley_id: alleyId, item: item });
    showNotification(`✨ Blend mode: ${mode.toUpperCase()}`);
}

// Set opacity for an item
function setItemOpacity(item, opacity) {
    console.log('Setting opacity:', opacity, 'for item:', item.id);
    item.opacity = opacity;
    const element = document.getElementById(`item-${item.id}`);
    if (element) {
        const contentElement = element.querySelector('.item-content');
        if (contentElement) {
            contentElement.style.opacity = (opacity / 100).toFixed(2);
            console.log('Applied opacity:', opacity + '%');
        }
    } else {
        console.error('Element not found:', `item-${item.id}`);
    }
    // Sync with other users
    socket.emit('update_item', { alley_id: alleyId, item: item });
}

// Hide context menu on click outside and deselect items
document.addEventListener('click', (e) => {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
    
    // Deselect if clicking on canvas (not on an item)
    if (e.target === canvas || e.target === itemsContainer) {
        document.querySelectorAll('.placed-item').forEach(el => {
            el.classList.remove('selected');
        });
        selectedItem = null;
    }
});

// Delete item
function deleteItem(itemId) {
    console.log('Deleting item:', itemId);
    placedItems = placedItems.filter(item => item.id !== itemId);
    const element = document.getElementById(`item-${itemId}`);
    if (element) {
        element.remove();
        console.log('Item removed from DOM');
    } else {
        console.error('Element not found:', `item-${itemId}`);
    }
    
    // Clear selection if this was the selected item
    if (selectedItem && selectedItem.id === itemId) {
        selectedItem = null;
    }
    
    socket.emit('remove_item', {
        alley_id: alleyId,
        item_id: itemId
    });
    
    showNotification('🗑️ Item deleted');
}

// Control buttons
const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all items?')) {
            placedItems = [];
            itemsContainer.innerHTML = '';
            socket.emit('clear_design', { alley_id: alleyId });
            showNotification('✨ Canvas cleared - start fresh!');
        }
    });
}

const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        showNotification('🌸 Design ready to share!');
    });
}

const gridToggle = document.getElementById('gridToggle');
if (gridToggle) {
    gridToggle.addEventListener('click', () => {
        canvas.classList.toggle('no-grid');
    });
}

const zoomInBtn = document.getElementById('zoomIn');
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
        zoomLevel = Math.min(2, zoomLevel + 0.1);
        canvas.style.transform = `scale(${zoomLevel})`;
    });
}

const zoomOutBtn = document.getElementById('zoomOut');
if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
        zoomLevel = Math.max(0.5, zoomLevel - 0.1);
        canvas.style.transform = `scale(${zoomLevel})`;
    });
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Hint notification system (bottom center)
function showHint(message) {
    // Remove any existing hints
    const existingHints = document.querySelectorAll('.hint-notification');
    existingHints.forEach(hint => hint.remove());
    
    const hint = document.createElement('div');
    hint.className = 'hint-notification';
    hint.textContent = message;
    document.body.appendChild(hint);
    
    setTimeout(() => {
        hint.style.animation = 'fadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => hint.remove(), 400);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedItem) {
        deleteItem(selectedItem.id);
        selectedItem = null;
    }
});

// Parallax camera drift effect
if (canvas) {
    const alleyBackground = document.querySelector('.alley-background');
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging && alleyBackground) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            // Subtle parallax movement
            const moveX = (x - 0.5) * 20;
            const moveY = (y - 0.5) * 20;
            
            alleyBackground.style.transform = `translate(${moveX}px, ${moveY}px)`;
            alleyBackground.style.transition = 'transform 0.3s ease-out';
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        if (alleyBackground) {
            alleyBackground.style.transform = 'translate(0, 0)';
        }
    });
}

// Cinematic lighting animation (subtle time-lapse effect)
if (canvas) {
    const alleyGround = document.querySelector('.alley-ground');
    let lightAngle = 0;
    
    setInterval(() => {
        lightAngle += 0.1;
        if (alleyGround) {
            const brightness = 1 + Math.sin(lightAngle) * 0.05;
            alleyGround.style.filter = `brightness(${brightness})`;
        }
    }, 100);
}

// Tab switching functionality
const categoryTabs = document.querySelectorAll('.category-tab');
const categoryContents = document.querySelectorAll('[data-category-content]');

categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const category = tab.dataset.category;
        
        // Update active tab
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        categoryContents.forEach(content => {
            if (content.dataset.categoryContent === category) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    });
});

// Custom artwork upload
const uploadArtInput = document.getElementById('uploadArt');
if (uploadArtInput) {
    uploadArtInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                
                // Add custom artwork to canvas
                if (canvas) {
                    const canvasRect = canvas.getBoundingClientRect();
                    const x = canvasRect.width / 2 - 100;
                    const y = canvasRect.height / 2 - 100;
                    
                    addItem('art', 'custom-photo', x, y, 200, 200, imageUrl);
                    showNotification('✨ Custom artwork added!');
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input so same file can be uploaded again
        e.target.value = '';
    });
}

// Reset button handler
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the canvas? This will remove all items.')) {
            placedItems = [];
            if (itemsContainer) {
                itemsContainer.innerHTML = '';
            }
            socket.emit('clear_design', { alley_id: alleyId });
            showNotification('🔄 Canvas reset!');
        }
    });
}

// Reinitialize Lucide icons after dynamic content loads
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

console.log('🌸 Alley Bloom - LA Urban Design Platform initialized');
