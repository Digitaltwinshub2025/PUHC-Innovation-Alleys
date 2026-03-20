// 3D Alley Demo with Three.js - LA Style
let scene, camera, renderer, controls;
let leftWall, rightWall, ground;
let placedMurals = [];
let currentMural = 'mural-1.jpg';
let currentBlendMode = 'multiply';
let currentOpacity = 0.85;
let raycaster, mouse;

// Initialize scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // LA Sky - Pale blue with warm tint
    scene.background = new THREE.Color(0xb8d4e8); // Pale blue LA sky
    scene.fog = new THREE.Fog(0xb8d4e8, 20, 60); // Atmospheric haze

    // Camera setup - Eye level
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.7, 12); // Eye level, start at end of alley

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Bright LA sunlight
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lighting - LA late afternoon sunlight
    const ambientLight = new THREE.AmbientLight(0xfff4e6, 0.5); // Warm ambient
    scene.add(ambientLight);

    // Main sun - warm, bright, from southwest
    const sunLight = new THREE.DirectionalLight(0xfff5e1, 1.2);
    sunLight.position.set(-8, 12, -5); // Late afternoon angle
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Fill light - soft blue from sky
    const fillLight = new THREE.DirectionalLight(0xb8d4e8, 0.3);
    fillLight.position.set(5, 8, 10);
    scene.add(fillLight);

    // Create alley geometry
    createAlley();

    // Raycaster for click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Controls (WASD + Mouse Look)
    setupControls();

    // UI Event Listeners
    setupUI();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Click to place mural
    renderer.domElement.addEventListener('click', onCanvasClick);

    // Start animation loop
    animate();
}

// Create the LA-style alley environment
function createAlley() {
    const textureLoader = new THREE.TextureLoader();

    // Ground - Cracked asphalt/concrete (25m long x 5m wide)
    const groundGeometry = new THREE.PlaneGeometry(5, 25);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a3a3a, // Dark gray asphalt
        roughness: 0.95,
        metalness: 0.05
    });
    
    // Add subtle noise for worn concrete look
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add cracks and stains
    for (let i = 0; i < 50; i++) {
        ctx.strokeStyle = `rgba(30, 30, 30, ${Math.random() * 0.3})`;
        ctx.lineWidth = Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.lineTo(Math.random() * 512, Math.random() * 512);
        ctx.stroke();
    }
    
    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(2, 10);
    groundMaterial.map = groundTexture;
    
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Left Wall - Stucco with faded paint (25m long x 4m high)
    const wallGeometry = new THREE.PlaneGeometry(25, 4);
    
    // Create stucco texture with grime
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 1024;
    wallCanvas.height = 256;
    const wallCtx = wallCanvas.getContext('2d');
    
    // Base stucco color - faded beige/tan
    wallCtx.fillStyle = '#d4c4a8';
    wallCtx.fillRect(0, 0, 1024, 256);
    
    // Add stucco texture
    for (let i = 0; i < 2000; i++) {
        wallCtx.fillStyle = `rgba(${180 + Math.random() * 40}, ${160 + Math.random() * 40}, ${130 + Math.random() * 30}, 0.3)`;
        wallCtx.fillRect(Math.random() * 1024, Math.random() * 256, 2, 2);
    }
    
    // Add grime and stains
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 256;
        const gradient = wallCtx.createRadialGradient(x, y, 0, x, y, 30 + Math.random() * 50);
        gradient.addColorStop(0, 'rgba(80, 70, 60, 0.2)');
        gradient.addColorStop(1, 'rgba(80, 70, 60, 0)');
        wallCtx.fillStyle = gradient;
        wallCtx.fillRect(x - 50, y - 50, 100, 100);
    }
    
    // Add faint graffiti marks
    for (let i = 0; i < 10; i++) {
        wallCtx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.15)`;
        wallCtx.lineWidth = 2 + Math.random() * 3;
        wallCtx.beginPath();
        const x = Math.random() * 1024;
        const y = Math.random() * 256;
        wallCtx.moveTo(x, y);
        wallCtx.lineTo(x + Math.random() * 100 - 50, y + Math.random() * 50 - 25);
        wallCtx.stroke();
    }
    
    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 1);
    
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        roughness: 0.85,
        metalness: 0.0
    });
    
    leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(0, 2, -2.5);
    leftWall.rotation.y = Math.PI;
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    leftWall.name = 'leftWall';
    scene.add(leftWall);

    // Right Wall
    rightWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
    rightWall.position.set(0, 2, 2.5);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    rightWall.name = 'rightWall';
    scene.add(rightWall);
    
    // Add atmospheric details
    addAlleyDetails();
}

// Add LA alley atmospheric details
function addAlleyDetails() {
    // Trash bins (low-poly)
    const binGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const binMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a4a2a, // Dark green
        roughness: 0.7,
        metalness: 0.3
    });
    
    // Bin 1 - Left side
    const bin1 = new THREE.Mesh(binGeometry, binMaterial);
    bin1.position.set(-1.8, 0.4, -8);
    bin1.castShadow = true;
    bin1.receiveShadow = true;
    scene.add(bin1);
    
    // Bin 2 - Right side
    const bin2 = new THREE.Mesh(binGeometry, binMaterial);
    bin2.position.set(1.8, 0.4, 3);
    bin2.castShadow = true;
    bin2.receiveShadow = true;
    scene.add(bin2);
    
    // Wall vents (simple boxes)
    const ventGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.1);
    const ventMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a4a4a,
        roughness: 0.9,
        metalness: 0.5
    });
    
    // Vents on left wall
    for (let i = 0; i < 3; i++) {
        const vent = new THREE.Mesh(ventGeometry, ventMaterial);
        vent.position.set(i * 5 - 5, 1.5 + Math.random() * 0.5, -2.45);
        vent.castShadow = true;
        scene.add(vent);
    }
    
    // Vents on right wall
    for (let i = 0; i < 3; i++) {
        const vent = new THREE.Mesh(ventGeometry, ventMaterial);
        vent.position.set(i * 5 - 5, 1.5 + Math.random() * 0.5, 2.45);
        vent.rotation.y = Math.PI;
        vent.castShadow = true;
        scene.add(vent);
    }
    
    // Utility box (electrical panel)
    const utilityGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.15);
    const utilityMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6a6a6a,
        roughness: 0.8,
        metalness: 0.4
    });
    
    const utilityBox = new THREE.Mesh(utilityGeometry, utilityMaterial);
    utilityBox.position.set(-2, 1.5, -2.4);
    utilityBox.castShadow = true;
    scene.add(utilityBox);
    
    // Small debris/litter (very simple)
    const debrisGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1);
    const debrisMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8a7a6a,
        roughness: 0.9
    });
    
    for (let i = 0; i < 8; i++) {
        const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
        debris.position.set(
            (Math.random() - 0.5) * 4,
            0.025,
            (Math.random() - 0.5) * 20
        );
        debris.rotation.y = Math.random() * Math.PI;
        debris.receiveShadow = true;
        scene.add(debris);
    }
}

// Setup WASD + Mouse controls
function setupControls() {
    const moveSpeed = 0.1;
    const lookSpeed = 0.002;
    
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false
    };

    let isPointerLocked = false;

    // Pointer lock for mouse look
    renderer.domElement.addEventListener('click', () => {
        renderer.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === renderer.domElement;
    });

    // Mouse movement
    document.addEventListener('mousemove', (e) => {
        if (isPointerLocked) {
            camera.rotation.y -= e.movementX * lookSpeed;
            camera.rotation.x -= e.movementY * lookSpeed;
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        }
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false;
    });

    // Movement update
    function updateMovement() {
        const direction = new THREE.Vector3();
        
        if (keys.w) direction.z -= moveSpeed;
        if (keys.s) direction.z += moveSpeed;
        if (keys.a) direction.x -= moveSpeed;
        if (keys.d) direction.x += moveSpeed;

        // Apply rotation to direction
        direction.applyQuaternion(camera.quaternion);
        direction.y = 0; // Keep on ground level
        
        camera.position.add(direction);

        // Boundaries - 5m wide, 25m long alley
        camera.position.x = Math.max(-2.0, Math.min(2.0, camera.position.x));
        camera.position.z = Math.max(-12, Math.min(12, camera.position.z));
        camera.position.y = 1.7; // Keep at eye level

        requestAnimationFrame(updateMovement);
    }
    updateMovement();
}

// Setup UI controls
function setupUI() {
    // Mural selection
    document.querySelectorAll('.mural-thumb').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            document.querySelectorAll('.mural-thumb').forEach(t => t.classList.remove('selected'));
            e.target.classList.add('selected');
            currentMural = `mural-${e.target.dataset.mural}.jpg`;
        });
    });

    // Blend mode buttons
    document.querySelectorAll('[data-blend]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('[data-blend]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentBlendMode = e.target.dataset.blend;
            updateAllMurals();
        });
    });

    // Opacity slider
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    opacitySlider.addEventListener('input', (e) => {
        currentOpacity = e.target.value / 100;
        opacityValue.textContent = e.target.value;
        updateAllMurals();
    });
}

// Place mural on wall
function onCanvasClick(event) {
    // Calculate mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([leftWall, rightWall]);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        placeMural(intersect.point, intersect.object);
    }
}

// Place mural at intersection point
function placeMural(position, wall) {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(`/static/images/artwork/${currentMural}`, (texture) => {
        // Create mural plane
        const muralGeometry = new THREE.PlaneGeometry(2, 1.5);
        const muralMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: currentOpacity,
            side: THREE.DoubleSide
        });

        // Apply blend mode (approximation in Three.js)
        applyBlendMode(muralMaterial, currentBlendMode);

        const mural = new THREE.Mesh(muralGeometry, muralMaterial);
        
        // Position slightly in front of wall
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
            muralFile: currentMural
        };

        scene.add(mural);
        placedMurals.push(mural);

        console.log(`Placed ${currentMural} at`, position);
    });
}

// Apply blend mode to material
function applyBlendMode(material, mode) {
    switch(mode) {
        case 'multiply':
            material.blending = THREE.MultiplyBlending;
            break;
        case 'overlay':
            material.blending = THREE.AdditiveBlending;
            break;
        case 'screen':
            material.blending = THREE.AdditiveBlending;
            material.opacity *= 0.7;
            break;
        case 'normal':
        default:
            material.blending = THREE.NormalBlending;
            break;
    }
}

// Update all placed murals
function updateAllMurals() {
    placedMurals.forEach(mural => {
        mural.material.opacity = currentOpacity;
        applyBlendMode(mural.material, currentBlendMode);
        mural.userData.blendMode = currentBlendMode;
        mural.userData.opacity = currentOpacity;
    });
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Start the demo
init();
