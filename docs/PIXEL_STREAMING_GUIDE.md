# Unreal Engine Pixel Streaming - Complete Guide

## 🎮 What is Pixel Streaming?

**Pixel Streaming** allows you to run Unreal Engine on a powerful server and stream the rendered 3D graphics to any web browser - like Netflix for interactive 3D content!

### **How It Works:**

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Unreal Engine  │ ──────> │ Signaling Server │ <────── │   Web Browser   │
│  (Game Running) │  Video  │  (WebRTC Relay)  │  Input  │  (User Device)  │
│   Your Desktop  │ Stream  │   Port 80/8888   │ Events  │   Any Device    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

**What Happens:**
1. Unreal Engine runs on your computer (or server)
2. It renders the 3D scene (Alley 3 with murals, plants, etc.)
3. The video is streamed to a Signaling Server
4. Users connect via web browser
5. They see the 3D scene and can interact (WASD, mouse)
6. Their inputs are sent back to Unreal Engine
7. Unreal Engine responds in real-time

---

## 🚀 Easy Setup Through Windsurf (Step-by-Step)

### **Prerequisites:**
- ✅ Unreal Engine 5.6 installed
- ✅ Alley 3 project (.uproject file)
- ✅ Flask website running
- ✅ Windows OS

---

## 📋 STEP-BY-STEP GUIDE

### **Step 1: Locate Signaling Server** (2 minutes)

The signaling server comes with Unreal Engine!

**Path:**
```
D:\Epic Games\UE_5.6\Engine\Plugins\Media\PixelStreaming2\Resources\WebServers\SignallingWebServer
```

**What it does:** Acts as a middleman between Unreal and web browsers

---

### **Step 2: Start Signaling Server** (1 minute)

**Open PowerShell and run:**

```powershell
# Navigate to signaling server
cd "D:\Epic Games\UE_5.6\Engine\Plugins\Media\PixelStreaming2\Resources\WebServers\SignallingWebServer\platform_scripts\cmd"

# Start the server
.\start.bat
```

**You should see:**
```
Signaling server running on port 80
WebRTC connection ready
Waiting for Unreal Engine connection...
```

**Keep this window open!** ✅

---

### **Step 3: Launch Unreal with Pixel Streaming** (2 minutes)

**Open another PowerShell window:**

```powershell
# Navigate to Unreal Engine
cd "D:\Epic Games\UE_5.6\Engine\Binaries\Win64"

# Launch your project with Pixel Streaming
.\UnrealEditor.exe "C:\Users\MLee7\Desktop\Alley 3.uproject" -game -PixelStreamingURL=ws://localhost:8888 -RenderOffScreen -AudioMixer
```

**Command breakdown:**
- `-game` = Run as game (not editor)
- `-PixelStreamingURL=ws://localhost:8888` = Connect to signaling server
- `-RenderOffScreen` = Don't show window (stream only)
- `-AudioMixer` = Enable audio streaming

**You should see:**
```
Pixel Streaming plugin initialized
Connected to signaling server
Waiting for browser connections...
```

**Keep this window open too!** ✅

---

### **Step 4: Create Web Viewer Page** (5 minutes)

Your Flask website needs a page to display the stream.

**File:** `templates/unreal_viewer.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Alley Experience - Alley Bloom</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/global-theme.css') }}">
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: var(--primary);
        }

        #player-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        #player {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Loading overlay */
        #loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--primary);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(15, 164, 175, 0.3);
            border-top-color: var(--highlight);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Controls overlay */
        .controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(2, 73, 80, 0.9);
            padding: 1rem 2rem;
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 0.875rem;
            z-index: 100;
        }

        .controls-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            text-align: center;
        }

        .control-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .key {
            background: var(--secondary);
            padding: 0.5rem;
            border-radius: 6px;
            min-width: 40px;
            margin-bottom: 0.25rem;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading">
        <div class="spinner"></div>
        <p style="color: var(--text-secondary); margin-top: 1rem;">Connecting to 3D Environment...</p>
    </div>

    <!-- Video Player Container -->
    <div id="player-container">
        <video id="player" autoplay playsinline></video>
    </div>

    <!-- Controls Guide -->
    <div class="controls">
        <div class="controls-grid">
            <div class="control-item">
                <div class="key">W A S D</div>
                <span>Move</span>
            </div>
            <div class="control-item">
                <div class="key">Mouse</div>
                <span>Look Around</span>
            </div>
            <div class="control-item">
                <div class="key">Shift</div>
                <span>Sprint</span>
            </div>
        </div>
    </div>

    <!-- Pixel Streaming WebRTC Script -->
    <script>
        // Configuration
        const signallingServerUrl = 'ws://localhost:8888';
        
        // WebRTC connection
        let peerConnection;
        let webSocket;
        let videoElement = document.getElementById('player');
        let loadingElement = document.getElementById('loading');

        // Connect to signaling server
        function connect() {
            webSocket = new WebSocket(signallingServerUrl);
            
            webSocket.onopen = () => {
                console.log('Connected to signaling server');
                setupPeerConnection();
            };
            
            webSocket.onmessage = async (event) => {
                const message = JSON.parse(event.data);
                await handleSignallingMessage(message);
            };
            
            webSocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                showError('Failed to connect to 3D environment');
            };
            
            webSocket.onclose = () => {
                console.log('Disconnected from signaling server');
                showError('Connection lost. Please refresh the page.');
            };
        }

        // Setup WebRTC peer connection
        function setupPeerConnection() {
            const config = {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
            
            peerConnection = new RTCPeerConnection(config);
            
            // Handle incoming video stream
            peerConnection.ontrack = (event) => {
                console.log('Received video stream');
                videoElement.srcObject = event.streams[0];
                loadingElement.style.display = 'none';
            };
            
            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    sendMessage({
                        type: 'iceCandidate',
                        candidate: event.candidate
                    });
                }
            };
            
            // Request stream from Unreal Engine
            sendMessage({ type: 'offer' });
        }

        // Handle signaling messages
        async function handleSignallingMessage(message) {
            switch (message.type) {
                case 'offer':
                    await peerConnection.setRemoteDescription(message.sdp);
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    sendMessage({ type: 'answer', sdp: answer });
                    break;
                    
                case 'answer':
                    await peerConnection.setRemoteDescription(message.sdp);
                    break;
                    
                case 'iceCandidate':
                    await peerConnection.addIceCandidate(message.candidate);
                    break;
            }
        }

        // Send message to signaling server
        function sendMessage(message) {
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(JSON.stringify(message));
            }
        }

        // Send keyboard/mouse input to Unreal Engine
        function setupInputHandlers() {
            // Keyboard
            document.addEventListener('keydown', (e) => {
                sendMessage({
                    type: 'input',
                    action: 'keyDown',
                    key: e.key
                });
            });
            
            document.addEventListener('keyup', (e) => {
                sendMessage({
                    type: 'input',
                    action: 'keyUp',
                    key: e.key
                });
            });
            
            // Mouse movement
            document.addEventListener('mousemove', (e) => {
                sendMessage({
                    type: 'input',
                    action: 'mouseMove',
                    x: e.movementX,
                    y: e.movementY
                });
            });
            
            // Mouse click
            document.addEventListener('mousedown', (e) => {
                sendMessage({
                    type: 'input',
                    action: 'mouseDown',
                    button: e.button
                });
            });
        }

        // Error handling
        function showError(message) {
            loadingElement.innerHTML = `
                <div style="color: var(--accent); font-size: 1.5rem; margin-bottom: 1rem;">⚠️</div>
                <p style="color: var(--text-primary);">${message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--highlight); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Retry
                </button>
            `;
        }

        // Initialize
        connect();
        setupInputHandlers();
    </script>
</body>
</html>
```

---

### **Step 5: Add Flask Route** (1 minute)

**File:** `app.py`

```python
@app.route('/unreal-viewer')
def unreal_viewer():
    # 3D Alley Experience with Pixel Streaming
    return render_template('unreal_viewer.html')
```

---

### **Step 6: Test It!** (2 minutes)

1. **Make sure all 3 services are running:**
   - ✅ Signaling Server (port 80/8888)
   - ✅ Unreal Engine with Pixel Streaming
   - ✅ Flask website (port 5000)

2. **Open browser:**
   ```
   http://localhost:5000/unreal-viewer
   ```

3. **You should see:**
   - Loading spinner
   - Then: Live 3D view of Alley 3!
   - Controls: WASD to move, mouse to look

---

## 🔧 TROUBLESHOOTING

### **Problem: "Failed to connect"**

**Solution:**
1. Check signaling server is running (PowerShell window 1)
2. Check Unreal Engine is running (PowerShell window 2)
3. Make sure ports 80 and 8888 are not blocked

### **Problem: "Black screen"**

**Solution:**
1. Unreal Engine might still be loading
2. Wait 30 seconds
3. Check Unreal Engine console for errors
4. Try refreshing browser

### **Problem: "No input working"**

**Solution:**
1. Click on the video player to focus
2. Check browser console for errors
3. Make sure WebSocket connection is established

---

## 🎯 EASY WINDSURF AUTOMATION

Want to automate this? Create these helper scripts:

### **1. Start All Services** (`start_pixel_streaming.bat`)

```batch
@echo off
echo Starting Pixel Streaming Services...

REM Start Signaling Server
start "Signaling Server" cmd /k "cd /d D:\Epic Games\UE_5.6\Engine\Plugins\Media\PixelStreaming2\Resources\WebServers\SignallingWebServer\platform_scripts\cmd && start.bat"

REM Wait 5 seconds
timeout /t 5

REM Start Unreal Engine
start "Unreal Engine" cmd /k "cd /d D:\Epic Games\UE_5.6\Engine\Binaries\Win64 && UnrealEditor.exe "C:\Users\MLee7\Desktop\Alley 3.uproject" -game -PixelStreamingURL=ws://localhost:8888 -RenderOffScreen -AudioMixer"

REM Wait 10 seconds
timeout /t 10

REM Start Flask
start "Flask Server" cmd /k "cd /d C:\Users\MLee7\Desktop\101225windsurf\CascadeProjects\splitwise && python app.py"

echo All services started!
echo Open browser to: http://localhost:5000/unreal-viewer
pause
```

### **2. Stop All Services** (`stop_pixel_streaming.bat`)

```batch
@echo off
echo Stopping Pixel Streaming Services...

REM Kill Unreal Engine
taskkill /F /IM UnrealEditor.exe

REM Kill Node.js (Signaling Server)
taskkill /F /IM node.exe

REM Kill Python (Flask)
taskkill /F /IM python.exe

echo All services stopped!
pause
```

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR COMPUTER                           │
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   Unreal     │      │  Signaling   │      │  Flask   │ │
│  │   Engine     │◄────►│   Server     │◄────►│  Website │ │
│  │  (Alley 3)   │      │  (Node.js)   │      │ (Python) │ │
│  │  Port: N/A   │      │  Port: 8888  │      │ Port:5000│ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│         │                      │                    │      │
└─────────┼──────────────────────┼────────────────────┼──────┘
          │                      │                    │
          │                      │                    │
          └──────────────────────┴────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    User's Browser       │
                    │  http://localhost:5000  │
                    │    /unreal-viewer       │
                    └─────────────────────────┘
```

---

## 🚀 PRODUCTION DEPLOYMENT (Future)

For real deployment (not localhost):

### **Option 1: Cloud Server (AWS, Azure)**
1. Rent GPU server (NVIDIA T4 or better)
2. Install Unreal Engine on server
3. Run signaling server on public IP
4. Users connect from anywhere

### **Option 2: Local Network**
1. Run everything on your computer
2. Share local IP address (e.g., 192.168.1.100)
3. Users on same WiFi can connect
4. Good for demos/presentations

---

## ✅ CHECKLIST

Before starting Pixel Streaming:

- [ ] Unreal Engine 5.6 installed
- [ ] Alley 3 project exists and opens
- [ ] Signaling server path is correct
- [ ] Flask website is working
- [ ] Ports 80, 8888, 5000 are available
- [ ] No firewall blocking connections

---

## 📝 QUICK REFERENCE

**Start Signaling Server:**
```powershell
cd "D:\Epic Games\UE_5.6\Engine\Plugins\Media\PixelStreaming2\Resources\WebServers\SignallingWebServer\platform_scripts\cmd"
.\start.bat
```

**Start Unreal with Pixel Streaming:**
```powershell
cd "D:\Epic Games\UE_5.6\Engine\Binaries\Win64"
.\UnrealEditor.exe "C:\Users\MLee7\Desktop\Alley 3.uproject" -game -PixelStreamingURL=ws://localhost:8888 -RenderOffScreen -AudioMixer
```

**Access in Browser:**
```
http://localhost:5000/unreal-viewer
```

---

**Total Setup Time:** ~15 minutes first time, ~2 minutes after that!

**Last Updated:** November 14, 2025
