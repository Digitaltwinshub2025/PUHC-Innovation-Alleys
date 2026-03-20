// 3D Alley Workspace - Photo-Realistic LA Alley with 2D-Style Controls
let scene, camera, renderer, controls;
let leftWall, rightWall, ground;
let placedMurals = [];
let selectedMural = null;
let currentMuralFile = 'mural-1.jpg';
let currentBlendMode = 'multiply';
let currentOpacity = 0.85;
let currentScale = 1.0;
let raycaster, mouse;
let isWalkMode = true;

// New: Drag and selection state
let isDragging = false;
let dragStartPosition = null;
let muralOutline = null;
let previewMural = null;
let contextMenu = null;

// Load 2D design data if available
function load2DDesignData() {
    const savedData = localStorage.getItem('alleyDesignData');
    if (savedData) {
        try {
            const designData = JSON.parse(savedData);
            console.log('Loaded 2D design data:', designData);
            
            // Convert 2D positions to 3D wall positions
            designData.items.forEach(item => {
                if (item.type === 'art') {
                    // Map 2D canvas coordinates to 3D wall positions
                    // Assuming canvas is roughly 1000px wide and walls are 10 units apart
                    const normalizedX = (item.x / designData.canvasSize.width) * 10 - 5; // -5 to 5
                    const normalizedY = 2 - (item.y / designData.canvasSize.height) * 3; // 0.5 to 3.5
                    
                    // Determine which wall (left or right based on X position)
                    const wallSide = normalizedX < 0 ? 'left' : 'right';
                    const wallZ = wallSide === 'left' ? -2.5 : 2.5;
                    
                    // Place mural on wall
                    const position = {
                        x: normalizedX,
                        y: normalizedY,
                        z: wallZ
                    };
                    
                    console.log(`Placing ${item.subtype} at`, position);
                    
                    // Load and place the mural
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.load(`/static/images/artwork/${item.subtype}.jpg`, (texture) => {
                        const muralGeometry = new THREE.PlaneGeometry(
                            (item.width / 100) || 2,
                            (item.height / 100) || 1.5
                        );
                        const muralMaterial = new THREE.MeshStandardMaterial({
                            map: texture,
                            transparent: true,
                            opacity: item.opacity || 0.85,
                            side: THREE.DoubleSide
                        });
                        
                        const mural = new THREE.Mesh(muralGeometry, muralMaterial);
                        mural.position.set(position.x, position.y, position.z);
                        
                        // Face the correct direction
                        if (wallSide === 'left') {
                            mural.rotation.y = 0;
                        } else {
                            mural.rotation.y = Math.PI;
                        }
                        
                        // Apply blend mode
                        applyBlendMode(mural.material, item.blendMode || 'multiply');
                        
                        mural.userData = {
                            muralFile: `${item.subtype}.jpg`,
                            blendMode: item.blendMode || 'multiply',
                            opacity: item.opacity || 0.85,
                            scale: 1.0
                        };
                        
                        scene.add(mural);
                        placedMurals.push(mural);
                    });
                }
            });
            
            showFeedbackTooltip(`✓ Loaded ${designData.items.length} items from 2D workspace`);
        } catch (error) {
            console.error('Error loading 2D design data:', error);
        }
    }
}

// Initialize
function init() {
    // Scene - Golden hour LA sky with gradient
    scene = new THREE.Scene();
    
    // Create gradient skybox (blue to orange horizon)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext('2d');
    const skyGradient = skyCtx.createLinearGradient(0, 0, 0, 512);
    skyGradient.addColorStop(0, '#a8c8d8'); // Pale blue top
    skyGradient.addColorStop(0.6, '#b8d0e0'); // Mid blue
    skyGradient.addColorStop(0.85, '#e8c8a8'); // Warm transition
    skyGradient.addColorStop(1, '#ffcc99'); // Orange horizon
    skyCtx.fillStyle = skyGradient;
    skyCtx.fillRect(0, 0, 512, 512);
    
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    scene.background = skyTexture;
    scene.fog = new THREE.Fog(0xb8d0e0, 30, 80); // Subtle atmospheric haze

    // Camera - Realistic human perspective (67° FOV for natural view)
    camera = new THREE.PerspectiveCamera(67, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.65, 8); // Human eye level (5'5" height)

    // Renderer - Hyper-realistic settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance",
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Advanced shadow settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    
    // Tone mapping for realistic exposure
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4; // Bright golden hour
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Enable physically correct lighting
    renderer.physicallyCorrectLights = true;
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Optimized Lighting - Two lights only for performance
    
    // 1. Ambient Light - Cool blue sky bounce (simulates global illumination)
    const ambientLight = new THREE.AmbientLight(0xb8d4e8, 0.5); // Cool blue ambient
    scene.add(ambientLight);

    // 2. Main Sun - Warm directional light at 35° angle (late afternoon LA)
    const sunLight = new THREE.DirectionalLight(0xffd699, 2.2);
    
    // Position for 35° angle from left-back
    const sunAngle = 35 * (Math.PI / 180);
    const sunDistance = 20;
    sunLight.position.set(
        -sunDistance * Math.cos(sunAngle), // X: left
        sunDistance * Math.sin(sunAngle),  // Y: 35° elevation
        -sunDistance * 0.5                  // Z: slightly back
    );
    
    // Optimized shadow settings
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048; // Reduced for performance
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.radius = 4; // Soft, diffused shadows
    sunLight.shadow.normalBias = 0.02;
    
    scene.add(sunLight);

    // Create environment
    createEnvironment();

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enabled = false; // Start in walk mode

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event listeners
    setupEventListeners();
    setupUI();
    
    // Load 2D design data if available
    setTimeout(() => {
        load2DDesignData();
    }, 1000); // Wait for scene to be fully initialized

    // Start animation
    animate();

    // Hide instructions after 3 seconds
    setTimeout(() => {
        document.getElementById('instructionsOverlay').classList.add('hidden');
    }, 3000);
}

// Create photo-realistic LA alley environment
function createEnvironment() {
    // Ground - Worn concrete with realistic detail
    const groundGeometry = new THREE.PlaneGeometry(5, 30);
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 1024;
    groundCanvas.height = 2048;
    const ctx = groundCanvas.getContext('2d');
    
    // Base concrete color - warm gray
    const grd = ctx.createLinearGradient(0, 0, 0, 2048);
    grd.addColorStop(0, '#6a6050');
    grd.addColorStop(0.5, '#5a5545');
    grd.addColorStop(1, '#4a4540');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1024, 2048);
    
    // Add realistic concrete texture
    for (let i = 0; i < 5000; i++) {
        const brightness = 40 + Math.random() * 30;
        ctx.fillStyle = `rgba(${brightness}, ${brightness - 5}, ${brightness - 10}, ${0.1 + Math.random() * 0.2})`;
        ctx.fillRect(Math.random() * 1024, Math.random() * 2048, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
    
    // Cracks and wear
    for (let i = 0; i < 80; i++) {
        ctx.strokeStyle = `rgba(30, 25, 20, ${0.3 + Math.random() * 0.4})`;
        ctx.lineWidth = 0.5 + Math.random() * 2;
        ctx.beginPath();
        const x = Math.random() * 1024;
        const y = Math.random() * 2048;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 200);
        ctx.stroke();
    }
    
    // Oil stains and dark patches
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 2048;
        const size = 40 + Math.random() * 80;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(20, 18, 15, 0.4)');
        gradient.addColorStop(1, 'rgba(20, 18, 15, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(1, 3);
    groundTexture.generateMipmaps = true; // Performance optimization
    groundTexture.minFilter = THREE.LinearMipmapLinearFilter;
    groundTexture.magFilter = THREE.LinearFilter;
    
    // Create roughness map for ground (varied roughness)
    const groundRoughnessCanvas = document.createElement('canvas');
    groundRoughnessCanvas.width = 512;
    groundRoughnessCanvas.height = 512;
    const grCtx = groundRoughnessCanvas.getContext('2d');
    grCtx.fillStyle = '#c0c0c0'; // Base roughness
    grCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1000; i++) {
        const brightness = 150 + Math.random() * 80;
        grCtx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        grCtx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }
    const groundRoughnessTexture = new THREE.CanvasTexture(groundRoughnessCanvas);
    groundRoughnessTexture.wrapS = groundRoughnessTexture.wrapT = THREE.RepeatWrapping;
    groundRoughnessTexture.repeat.set(1, 3);
    groundRoughnessTexture.generateMipmaps = true;
    
    // PBR Material for ground with roughness map
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughnessMap: groundRoughnessTexture,
        roughness: 0.95,
        metalness: 0.0,
        envMapIntensity: 0.2
    });
    
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Walls - Photo-realistic stucco with weathering
    const wallGeometry = new THREE.PlaneGeometry(30, 4.5);
    
    // Create highly detailed wall texture
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 2048;
    wallCanvas.height = 512;
    const wallCtx = wallCanvas.getContext('2d');
    
    // Base stucco - warm beige/tan like in photo
    const wallGrd = wallCtx.createLinearGradient(0, 0, 2048, 0);
    wallGrd.addColorStop(0, '#d4c4a8');
    wallGrd.addColorStop(0.3, '#cebda0');
    wallGrd.addColorStop(0.7, '#c8b598');
    wallGrd.addColorStop(1, '#d0bfa5');
    wallCtx.fillStyle = wallGrd;
    wallCtx.fillRect(0, 0, 2048, 512);
    
    // Stucco texture - very detailed
    for (let i = 0; i < 8000; i++) {
        const r = 190 + Math.random() * 40;
        const g = 170 + Math.random() * 35;
        const b = 140 + Math.random() * 30;
        wallCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.15 + Math.random() * 0.25})`;
        const size = 1 + Math.random() * 2;
        wallCtx.fillRect(Math.random() * 2048, Math.random() * 512, size, size);
    }
    
    // Water stains and weathering (like in photo)
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 512;
        const w = 60 + Math.random() * 150;
        const h = 80 + Math.random() * 200;
        const gradient = wallCtx.createRadialGradient(x, y, 0, x, y, Math.max(w, h));
        gradient.addColorStop(0, 'rgba(100, 85, 70, 0.25)');
        gradient.addColorStop(0.5, 'rgba(110, 95, 80, 0.15)');
        gradient.addColorStop(1, 'rgba(120, 105, 90, 0)');
        wallCtx.fillStyle = gradient;
        wallCtx.fillRect(x - w, y - h, w * 2, h * 2);
    }
    
    // Subtle cracks
    for (let i = 0; i < 25; i++) {
        wallCtx.strokeStyle = `rgba(90, 75, 60, ${0.2 + Math.random() * 0.3})`;
        wallCtx.lineWidth = 0.5 + Math.random();
        wallCtx.beginPath();
        const x = Math.random() * 2048;
        const y = Math.random() * 512;
        wallCtx.moveTo(x, y);
        wallCtx.lineTo(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 100);
        wallCtx.stroke();
    }
    
    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(3, 1);
    wallTexture.generateMipmaps = true; // Performance optimization
    wallTexture.minFilter = THREE.LinearMipmapLinearFilter;
    wallTexture.magFilter = THREE.LinearFilter;
    
    // Create normal map for realistic depth (better than bump map)
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 1024;
    normalCanvas.height = 512;
    const normCtx = normalCanvas.getContext('2d');
    
    // Base normal (pointing outward - bluish)
    normCtx.fillStyle = '#8080ff';
    normCtx.fillRect(0, 0, 1024, 512);
    
    // Add stucco bumps to normal map
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const size = 1 + Math.random() * 2;
        const variation = Math.random() * 40 - 20;
        normCtx.fillStyle = `rgb(${128 + variation}, ${128 + variation}, ${200 + Math.random() * 55})`;
        normCtx.fillRect(x, y, size, size);
    }
    
    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(3, 1);
    normalTexture.generateMipmaps = true;
    
    // Create roughness map for walls
    const wallRoughnessCanvas = document.createElement('canvas');
    wallRoughnessCanvas.width = 512;
    wallRoughnessCanvas.height = 256;
    const wrCtx = wallRoughnessCanvas.getContext('2d');
    wrCtx.fillStyle = '#d0d0d0'; // Base roughness
    wrCtx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 1500; i++) {
        const brightness = 180 + Math.random() * 60;
        wrCtx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        wrCtx.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
    }
    const wallRoughnessTexture = new THREE.CanvasTexture(wallRoughnessCanvas);
    wallRoughnessTexture.wrapS = wallRoughnessTexture.wrapT = THREE.RepeatWrapping;
    wallRoughnessTexture.repeat.set(3, 1);
    wallRoughnessTexture.generateMipmaps = true;
    
    // PBR Material for walls with normal map and roughness map
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(0.3, 0.3), // Subtle depth
        roughnessMap: wallRoughnessTexture,
        roughness: 0.92,
        metalness: 0.0,
        envMapIntensity: 0.15
    });
    
    // Left wall
    leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(0, 2.25, -2.5);
    leftWall.rotation.y = Math.PI;
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    leftWall.name = 'leftWall';
    scene.add(leftWall);
    
    // Right wall
    rightWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
    rightWall.position.set(0, 2.25, 2.5);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    rightWall.name = 'rightWall';
    scene.add(rightWall);
    
    // Add realistic details
    addRealisticDetails();
}

// Add realistic environmental details matching reference photo
function addRealisticDetails() {
    // Trash bins - Dark green/black like in photo
    const binGeometry = new THREE.BoxGeometry(0.7, 0.9, 0.7);
    const binMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a2a1a,
        roughness: 0.8,
        metalness: 0.2
    });

    const bin1 = new THREE.Mesh(binGeometry, binMaterial);
    bin1.position.set(-1.9, 0.45, -6);
    bin1.castShadow = true;
    bin1.receiveShadow = true;
    scene.add(bin1);

    const bin2 = new THREE.Mesh(binGeometry, binMaterial);
    bin2.position.set(-1.7, 0.45, -7);
    bin2.castShadow = true;
    bin2.receiveShadow = true;
    scene.add(bin2);

    // Power poles in distance
    const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 6, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3a2a,
        roughness: 0.9
    });

    const pole1 = new THREE.Mesh(poleGeometry, poleMaterial);
    pole1.position.set(-2.3, 3, -15);
    pole1.castShadow = true;
    scene.add(pole1);

    const pole2 = new THREE.Mesh(poleGeometry, poleMaterial);
    pole2.position.set(-2.3, 3, -25);
    pole2.castShadow = true;
    scene.add(pole2);

    // Power lines
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x2a2a2a,
        linewidth: 1
    });

    for (let i = 0; i < 3; i++) {
        const points = [];
        points.push(new THREE.Vector3(-2.3, 5.5 - i * 0.3, -15));
        points.push(new THREE.Vector3(-2.3, 5.5 - i * 0.3, -25));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
    }

    // Wall vents/windows
    const ventGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.08);
    const ventMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.9,
        metalness: 0.4
    });

    // Left wall vents
    const vent1 = new THREE.Mesh(ventGeometry, ventMaterial);
    vent1.position.set(-1.5, 2.5, -2.46);
    vent1.castShadow = true;
    scene.add(vent1);

    // Small window on left wall
    const windowGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.08);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2520,
        roughness: 0.3,
        metalness: 0.1
    });

    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(2, 2, -2.46);
    scene.add(window1);

    // Graffiti on left wall (simple dark mark)
    const graffitiCanvas = document.createElement('canvas');
    graffitiCanvas.width = 256;
    graffitiCanvas.height = 256;
    const gCtx = graffitiCanvas.getContext('2d');
    gCtx.fillStyle = 'transparent';
    gCtx.fillRect(0, 0, 256, 256);
    gCtx.font = 'bold 80px Arial';
    gCtx.fillStyle = 'rgba(60, 50, 40, 0.6)';
    gCtx.fillText('Gork!', 20, 120);
    
    const graffitiTexture = new THREE.CanvasTexture(graffitiCanvas);
    const graffitiMaterial = new THREE.MeshBasicMaterial({
        map: graffitiTexture,
        transparent: true,
        opacity: 0.7
    });
    
    const graffitiGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    const graffiti = new THREE.Mesh(graffitiGeometry, graffitiMaterial);
    graffiti.position.set(-3, 1.5, -2.49);
    graffiti.rotation.y = Math.PI;
    scene.add(graffiti);
}

// Setup event listeners
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('contextmenu', onRightClick);
    document.addEventListener('keydown', onKeyDown);

    // Walk mode controls - Enhanced with vertical movement
    const keys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false, space: false };
    const moveSpeed = 0.1;
    const verticalSpeed = 0.08;

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys && !e.ctrlKey && !e.metaKey) {
            keys[key] = true;
        }
        if (e.key === 'Shift') keys.shift = true;
        if (e.key === ' ') {
            keys.space = true;
            e.preventDefault(); // Prevent page scroll
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) keys[key] = false;
        if (e.key === 'Shift') keys.shift = false;
        if (e.key === ' ') keys.space = false;
    });

    function updateWalkMovement() {
        if (isWalkMode) {
            const direction = new THREE.Vector3();
            
            // Horizontal movement (WASD)
            if (keys.w) direction.z -= moveSpeed;
            if (keys.s) direction.z += moveSpeed;
            if (keys.a) direction.x -= moveSpeed;
            if (keys.d) direction.x += moveSpeed;

            // Apply camera rotation to horizontal movement
            direction.applyQuaternion(camera.quaternion);
            direction.y = 0; // Reset Y before adding vertical movement
            
            camera.position.add(direction);
            
            // Vertical movement (Q/E or Shift/Space)
            if (keys.q || keys.shift) camera.position.y -= verticalSpeed; // Down
            if (keys.e || keys.space) camera.position.y += verticalSpeed; // Up

            // Boundaries
            camera.position.x = Math.max(-2.0, Math.min(2.0, camera.position.x));
            camera.position.z = Math.max(-12, Math.min(12, camera.position.z));
            camera.position.y = Math.max(0.5, Math.min(3.5, camera.position.y)); // Vertical bounds
        }
        requestAnimationFrame(updateWalkMovement);
    }
    updateWalkMovement();
}

// Setup UI controls
function setupUI() {
    // Mural library items
    document.querySelectorAll('.mural-item').forEach(item => {
        item.addEventListener('click', () => {
            currentMuralFile = item.dataset.mural;
            document.querySelectorAll('.mural-item').forEach(i => i.style.borderColor = 'transparent');
            item.style.borderColor = '#FF6F61';
        });
    });

    // Blend mode selects
    const blendSelects = [document.getElementById('blendModeSelect'), document.getElementById('blendModeSidebar')];
    blendSelects.forEach(select => {
        if (select) {
            select.addEventListener('change', (e) => {
                currentBlendMode = e.target.value;
                blendSelects.forEach(s => { if (s) s.value = currentBlendMode; });
                if (selectedMural) {
                    applyMuralProperties(selectedMural);
                }
                const modeName = e.target.options[e.target.selectedIndex].text;
                showFeedbackTooltip(`Blend: ${modeName}`);
            });
        }
    });

    // Opacity sliders
    const opacitySliders = [
        { slider: document.getElementById('opacitySliderTop'), value: document.getElementById('opacityValueTop') },
        { slider: document.getElementById('opacitySidebar'), value: document.getElementById('opacityValueSidebar') }
    ];

    opacitySliders.forEach(({ slider, value }) => {
        if (slider) {
            slider.addEventListener('input', (e) => {
                currentOpacity = e.target.value / 100;
                opacitySliders.forEach(({ slider: s, value: v }) => {
                    if (s) s.value = e.target.value;
                    if (v) v.textContent = e.target.value + (v.id.includes('Top') ? '%' : '');
                });
                if (selectedMural) {
                    applyMuralProperties(selectedMural);
                }
                showFeedbackTooltip(`Opacity: ${e.target.value}%`);
            });
        }
    });

    // Scale slider
    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');
    if (scaleSlider) {
        scaleSlider.addEventListener('input', (e) => {
            currentScale = e.target.value / 100;
            scaleValue.textContent = e.target.value;
            if (selectedMural) {
                selectedMural.scale.set(currentScale * 2, currentScale * 1.5, 1);
            }
        });
    }

    // Delete buttons
    [document.getElementById('deleteMuralBtn'), document.getElementById('deleteSidebarBtn')].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', deleteMural);
        }
    });

    // View mode buttons
    document.getElementById('walkModeBtn').addEventListener('click', () => {
        isWalkMode = true;
        controls.enabled = false;
        document.getElementById('walkModeBtn').classList.add('active');
        document.getElementById('viewModeBtn').classList.remove('active');
    });

    document.getElementById('viewModeBtn').addEventListener('click', () => {
        isWalkMode = false;
        controls.enabled = true;
        document.getElementById('viewModeBtn').classList.add('active');
        document.getElementById('walkModeBtn').classList.remove('active');
    });

    // Sidebar toggle
    document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
        document.getElementById('rightSidebar').classList.toggle('hidden');
    });

    document.getElementById('closeSidebarBtn').addEventListener('click', () => {
        document.getElementById('rightSidebar').classList.add('hidden');
    });

    // Panel minimize
    document.getElementById('minimizePanelBtn').addEventListener('click', () => {
        document.getElementById('bottomPanel').classList.toggle('minimized');
    });

    // Instructions
    document.getElementById('closeInstructionsBtn').addEventListener('click', () => {
        document.getElementById('instructionsOverlay').classList.add('hidden');
    });
}

// Click to place or select mural
function onCanvasClick(event) {
    if (isDragging) return; // Don't place if we were dragging
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // First check if clicking on existing mural
    const muralIntersects = raycaster.intersectObjects(placedMurals);
    if (muralIntersects.length > 0) {
        selectMural(muralIntersects[0].object);
        return;
    }
    
    // Then check walls for placement
    const wallIntersects = raycaster.intersectObjects([leftWall, rightWall]);
    if (wallIntersects.length > 0) {
        const intersect = wallIntersects[0];
        placeMural(intersect.point, intersect.object);
    } else {
        // Clicked empty space - deselect
        deselectMural();
    }
}

// Mouse down - start drag
function onMouseDown(event) {
    if (event.button !== 0) return; // Only left click
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(placedMurals);
    
    if (intersects.length > 0) {
        isDragging = true;
        dragStartPosition = intersects[0].point.clone();
        selectMural(intersects[0].object);
        renderer.domElement.style.cursor = 'grabbing';
    }
}

// Mouse move - drag mural or show preview
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Update cursor based on hover
    const muralIntersects = raycaster.intersectObjects(placedMurals);
    if (muralIntersects.length > 0) {
        renderer.domElement.style.cursor = 'grab';
    } else {
        renderer.domElement.style.cursor = 'default';
    }
    
    // Drag selected mural
    if (isDragging && selectedMural) {
        const wallIntersects = raycaster.intersectObjects([leftWall, rightWall]);
        if (wallIntersects.length > 0) {
            const newPosition = wallIntersects[0].point;
            selectedMural.position.copy(newPosition);
            
            // Keep offset from wall
            if (wallIntersects[0].object.name === 'leftWall') {
                selectedMural.position.z -= 0.01;
            } else {
                selectedMural.position.z += 0.01;
            }
        }
    }
}

// Mouse up - end drag
function onMouseUp(event) {
    isDragging = false;
    dragStartPosition = null;
    renderer.domElement.style.cursor = 'default';
}

// Right click - context menu
function onRightClick(event) {
    event.preventDefault();
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(placedMurals);
    
    if (intersects.length > 0) {
        selectMural(intersects[0].object);
        showContextMenu(event.clientX, event.clientY);
    }
}

// Keyboard shortcuts
function onKeyDown(event) {
    // Delete key
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedMural) {
        deleteMural();
        event.preventDefault();
    }
    
    // Escape - deselect
    if (event.key === 'Escape') {
        deselectMural();
        hideContextMenu();
    }
}

// Select mural
function selectMural(mural) {
    // Remove previous outline
    if (muralOutline) {
        scene.remove(muralOutline);
    }
    
    selectedMural = mural;
    
    // Create selection outline
    const outlineGeometry = new THREE.EdgesGeometry(mural.geometry);
    const outlineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xff6f61, 
        linewidth: 3 
    });
    muralOutline = new THREE.LineSegments(outlineGeometry, outlineMaterial);
    muralOutline.position.copy(mural.position);
    muralOutline.rotation.copy(mural.rotation);
    muralOutline.scale.copy(mural.scale);
    scene.add(muralOutline);
    
    // Update UI
    updateSelectedMuralInfo();
    
    // Update controls to match selected mural
    if (mural.userData) {
        currentOpacity = mural.userData.opacity || 0.85;
        currentBlendMode = mural.userData.blendMode || 'multiply';
        currentScale = mural.userData.scale || 1.0;
        
        // Update UI controls
        const opacitySliders = [
            { slider: document.getElementById('opacitySliderTop'), value: document.getElementById('opacityValueTop') },
            { slider: document.getElementById('opacitySidebar'), value: document.getElementById('opacityValueSidebar') }
        ];
        opacitySliders.forEach(({ slider, value }) => {
            if (slider) {
                slider.value = currentOpacity * 100;
                if (value) value.textContent = Math.round(currentOpacity * 100) + (value.id.includes('Top') ? '%' : '');
            }
        });
        
        const blendSelects = [document.getElementById('blendModeSelect'), document.getElementById('blendModeSidebar')];
        blendSelects.forEach(select => {
            if (select) select.value = currentBlendMode;
        });
    }
}

// Deselect mural
function deselectMural() {
    selectedMural = null;
    
    if (muralOutline) {
        scene.remove(muralOutline);
        muralOutline = null;
    }
    
    updateSelectedMuralInfo();
}

// Delete mural
function deleteMural() {
    if (selectedMural) {
        scene.remove(selectedMural);
        placedMurals = placedMurals.filter(m => m !== selectedMural);
        
        if (muralOutline) {
            scene.remove(muralOutline);
            muralOutline = null;
        }
        
        selectedMural = null;
        updateSelectedMuralInfo();
        hideContextMenu();
    }
}

// Show context menu
function showContextMenu(x, y) {
    hideContextMenu();
    
    contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenu3D';
    contextMenu.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: rgba(30, 30, 30, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 8px;
        padding: 0.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 180px;
    `;
    
    const menuItems = [
        { label: 'Delete', icon: '🗑️', action: deleteMural },
        { label: 'Bring Forward', icon: '⬆️', action: () => console.log('Bring forward') },
        { label: 'Send Backward', icon: '⬇️', action: () => console.log('Send backward') }
    ];
    
    menuItems.forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = `${item.icon} ${item.label}`;
        btn.style.cssText = `
            width: 100%;
            padding: 0.75rem 1rem;
            background: transparent;
            border: none;
            color: white;
            text-align: left;
            cursor: pointer;
            border-radius: 4px;
            font-size: 0.9rem;
            transition: background 0.2s;
        `;
        btn.onmouseover = () => btn.style.background = 'rgba(255,111,97,0.2)';
        btn.onmouseout = () => btn.style.background = 'transparent';
        btn.onclick = () => {
            item.action();
            hideContextMenu();
        };
        contextMenu.appendChild(btn);
    });
    
    document.body.appendChild(contextMenu);
    
    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', hideContextMenu, { once: true });
    }, 100);
}

// Hide context menu
function hideContextMenu() {
    if (contextMenu) {
        contextMenu.remove();
        contextMenu = null;
    }
}

// Place mural on wall
function placeMural(position, wall) {
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(`/static/images/artwork/${currentMuralFile}`, (texture) => {
        const muralGeometry = new THREE.PlaneGeometry(2, 1.5);
        const muralMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: currentOpacity,
            side: THREE.DoubleSide
        });

        applyBlendMode(muralMaterial, currentBlendMode);

        const mural = new THREE.Mesh(muralGeometry, muralMaterial);
        mural.position.copy(position);

        if (wall.name === 'leftWall') {
            mural.position.z -= 0.01;
            mural.rotation.y = Math.PI;
        } else {
            mural.position.z += 0.01;
        }

        mural.userData = {
            blendMode: currentBlendMode,
            opacity: currentOpacity,
            scale: currentScale,
            muralFile: currentMuralFile
        };

        scene.add(mural);
        placedMurals.push(mural);
        selectedMural = mural;
        updateSelectedMuralInfo();
    });
}

// Apply blend mode with proper Three.js blending
function applyBlendMode(material, mode) {
    // Reset to defaults first
    material.transparent = true;
    material.depthWrite = true;
    
    switch (mode) {
        case 'multiply':
            material.blending = THREE.CustomBlending;
            material.blendEquation = THREE.AddEquation;
            material.blendSrc = THREE.DstColorFactor;
            material.blendDst = THREE.OneMinusSrcAlphaFactor;
            break;
        case 'screen':
            material.blending = THREE.CustomBlending;
            material.blendEquation = THREE.AddEquation;
            material.blendSrc = THREE.OneFactor;
            material.blendDst = THREE.OneMinusSrcColorFactor;
            break;
        case 'overlay':
        case 'soft-light':
            // Overlay/Soft Light approximation
            material.blending = THREE.CustomBlending;
            material.blendEquation = THREE.AddEquation;
            material.blendSrc = THREE.SrcAlphaFactor;
            material.blendDst = THREE.OneMinusSrcAlphaFactor;
            break;
        case 'normal':
        default:
            material.blending = THREE.NormalBlending;
            material.blendSrc = THREE.SrcAlphaFactor;
            material.blendDst = THREE.OneMinusSrcAlphaFactor;
            break;
    }
    
    material.needsUpdate = true;
}

// Apply properties to selected mural
function applyMuralProperties(mural) {
    if (mural && mural.material) {
        // Update opacity
        mural.material.opacity = currentOpacity;
        mural.material.transparent = true;
        
        // Update blend mode
        applyBlendMode(mural.material, currentBlendMode);
        
        // Store in userData
        mural.userData.blendMode = currentBlendMode;
        mural.userData.opacity = currentOpacity;
        
        // Force material update
        mural.material.needsUpdate = true;
    }
}

// Show feedback tooltip
let feedbackTimeout = null;
function showFeedbackTooltip(message) {
    // Remove existing tooltip
    let tooltip = document.getElementById('feedbackTooltip');
    if (tooltip) tooltip.remove();
    
    // Create new tooltip
    tooltip = document.createElement('div');
    tooltip.id = 'feedbackTooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 111, 97, 0.95);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10001;
        pointer-events: none;
        animation: fadeInOut 1.5s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(tooltip);
    
    // Auto-remove after animation
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
        if (tooltip) tooltip.remove();
    }, 1500);
}

// Update selected mural info
function updateSelectedMuralInfo() {
    const info = document.getElementById('selectedMuralInfo');
    if (selectedMural) {
        info.innerHTML = `<p style="color: #FF6F61; font-weight: 600;">✓ Mural Selected</p>
                          <p style="font-size: 0.85rem; margin-top: 0.5rem; color: rgba(255,255,255,0.7);">File: ${selectedMural.userData.muralFile}</p>
                          <p style="font-size: 0.75rem; margin-top: 0.25rem; color: rgba(255,255,255,0.5);">Press Delete to remove</p>`;
    } else {
        info.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Click a mural to select</p>';
    }
}

// Window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (controls.enabled) {
        controls.update();
    }
    renderer.render(scene, camera);
}

// Load 3D Model (glTF/GLB)
function load3DModel(modelPath, position = { x: 0, y: 0, z: 0 }, scale = 1, rotation = { x: 0, y: 0, z: 0 }) {
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene;
            
            // Position
            model.position.set(position.x, position.y, position.z);
            
            // Scale
            model.scale.set(scale, scale, scale);
            
            // Rotation
            model.rotation.set(rotation.x, rotation.y, rotation.z);
            
            // Enable shadows
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(model);
            console.log('3D Model loaded:', modelPath);
            return model;
        },
        (progress) => {
            console.log('Loading:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.error('Error loading model:', error);
        }
    );
}

// Load 360° Panorama (Google Street View / Earth Studio)
function load360Panorama(imagePath, radius = 50) {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(imagePath, (texture) => {
        // Create sphere geometry (inside-out)
        const geometry = new THREE.SphereGeometry(radius, 60, 40);
        geometry.scale(-1, 1, 1); // Flip inside-out
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide // Render inside of sphere
        });
        
        const panorama = new THREE.Mesh(geometry, material);
        panorama.name = 'panorama';
        scene.add(panorama);
        
        console.log('360° Panorama loaded:', imagePath);
        
        // Optional: Hide procedural walls if using panorama
        if (leftWall) leftWall.visible = false;
        if (rightWall) rightWall.visible = false;
        if (ground) ground.visible = false;
    });
}

// Load Flat Photo as Wall Texture (Street View Screenshot)
function loadPhotoAsWall(imagePath, wallSide = 'left') {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(imagePath, (texture) => {
        const wall = wallSide === 'left' ? leftWall : rightWall;
        
        if (wall && wall.material) {
            // Replace wall texture with photo
            wall.material.map = texture;
            wall.material.needsUpdate = true;
            console.log(`${wallSide} wall texture updated with photo`);
        }
    });
}

// Example: Load custom 3D models
// Uncomment and modify these lines to load your Sketchfab models:

// Load a custom alley environment
// load3DModel('/static/models/alley.glb', { x: 0, y: 0, z: 0 }, 1, { x: 0, y: 0, z: 0 });

// Load decorative objects
// load3DModel('/static/models/dumpster.glb', { x: -3, y: 0, z: -5 }, 0.5, { x: 0, y: Math.PI/4, z: 0 });
// load3DModel('/static/models/graffiti-wall.glb', { x: -5, y: 0, z: 0 }, 1, { x: 0, y: Math.PI/2, z: 0 });

// Example: Load 360° Street View panorama
// load360Panorama('/static/images/panoramas/echo-park-alley.jpg');

// Example: Load flat photo as wall texture
// loadPhotoAsWall('/static/images/street-view-left.jpg', 'left');
// loadPhotoAsWall('/static/images/street-view-right.jpg', 'right');

// Initialize
init();
