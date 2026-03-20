# 🌸 Alley Bloom

**Design Your Space. Transform Your Neighborhood.**

A collaborative web platform that empowers LA residents to co-design and visualize alley transformations in real-time. Drag and drop art, plants, and urban furniture to reimagine community spaces with the vibrant spirit of Los Angeles.

## ✨ Features

- **🎨 Interactive Design Canvas**: Drag and drop elements onto a visual alley representation
- **👥 Real-Time Collaboration**: Multiple residents can design together simultaneously using WebSocket technology
- **🌿 Rich Asset Library**: 
  - Art & Murals (abstract art, geometric designs, sculptures, street art)
  - Plants & Greenery (trees, flowers, vertical gardens, shrubs, vines)
  - Lighting & Furniture (benches, string lights, bike racks)
- **🖱️ Intuitive Controls**:
  - Drag items to reposition
  - Resize items with corner handles
  - Right-click context menu for advanced options
  - Layer management (bring forward/send backward)
- **💾 Auto-Save**: All changes are automatically saved and synced across all users
- **📐 Design Tools**: Grid toggle, zoom in/out for precise placement
- **🎯 Multiple Alley Spaces**: Create and manage different alley design projects

## 🚀 Quick Start

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd c:\Users\MLee7\Desktop\101225windsurf\CascadeProjects\splitwise
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## 🎮 How to Use

### Getting Started

1. **Select an Alley**: From the home page, choose an existing alley or create a new one
2. **Browse Design Elements**: The left sidebar contains all available items organized by category
3. **Add Items**: Drag items from the sidebar and drop them onto the canvas
4. **Position & Resize**: 
   - Click and drag items to move them
   - Use the resize handle (bottom-right corner) to adjust size
5. **Manage Layers**: Right-click on items to access options like delete, bring forward, or send backward
6. **Collaborate**: Share the URL with other residents to design together in real-time

### Keyboard Shortcuts

- **Delete**: Remove selected item
- **Grid Toggle**: Show/hide alignment grid
- **Zoom**: Use zoom buttons to get closer or see the full view

### Controls

- **🗑️ Clear All**: Remove all items from the canvas
- **💾 Save Design**: Designs are auto-saved, but you can manually trigger a save
- **📐 Toggle Grid**: Show/hide the alignment grid
- **🔍 Zoom**: Adjust canvas zoom level

## 🏗️ Project Structure

```
splitwise/
├── app.py                  # Flask application with WebSocket server
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── static/
│   ├── css/
│   │   └── style.css      # All styling and animations
│   └── js/
│       └── main.js        # Client-side logic and real-time sync
└── templates/
    ├── index.html         # Landing page
    └── design.html        # Main design interface
```

## 🔧 Technical Details

### Backend (Flask + SocketIO)

- **Framework**: Flask 3.0.0
- **Real-Time Communication**: Flask-SocketIO for WebSocket support
- **Data Storage**: In-memory storage (can be extended to database)
- **Events**:
  - `join_alley`: User joins a design space
  - `add_item`: New item added to canvas
  - `update_item`: Item moved or resized
  - `remove_item`: Item deleted
  - `clear_design`: All items removed

### Frontend

- **Vanilla JavaScript**: No framework dependencies for maximum performance
- **Socket.IO Client**: Real-time bidirectional communication
- **Drag & Drop API**: Native HTML5 drag and drop
- **Responsive Design**: Works on desktop and tablet devices

### Design Elements

Each element has:
- Unique emoji representation
- Gradient background
- Default size (customizable)
- Type classification (art, plant, furniture)

## 🌐 Deployment

### Local Network Access

To allow other residents on your network to access the application:

1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Share the URL with residents:
   ```
   http://YOUR_IP_ADDRESS:5000
   ```

### Production Deployment

For production deployment, consider:

1. **Use a production WSGI server** (e.g., Gunicorn)
2. **Add a reverse proxy** (e.g., Nginx)
3. **Enable HTTPS** for secure connections
4. **Add database persistence** (e.g., PostgreSQL, MongoDB)
5. **Implement user authentication** for access control
6. **Add image upload** for custom art and photos

## 🎨 Customization

### Adding New Design Elements

Edit `static/js/main.js` and add to the `itemConfigs` object:

```javascript
'your-type': {
    'your-subtype': { 
        emoji: '🎯', 
        bg: 'linear-gradient(135deg, #color1 0%, #color2 100%)', 
        size: { w: 100, h: 100 } 
    }
}
```

Then add the corresponding HTML in `templates/design.html` sidebar.

### Styling

Modify `static/css/style.css` to customize:
- Colors and gradients
- Layout and spacing
- Animations and transitions
- Responsive breakpoints

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 is occupied, change it in `app.py`:
```python
socketio.run(app, debug=True, host='0.0.0.0', port=8080)
```

### WebSocket Connection Issues

- Ensure firewall allows the port
- Check that eventlet is properly installed
- Verify browser supports WebSocket (all modern browsers do)

### Items Not Syncing

- Check browser console for errors
- Verify Socket.IO connection status
- Ensure multiple users are on the same alley URL

## 📝 Future Enhancements

- [ ] User authentication and profiles
- [ ] Save/load multiple design versions
- [ ] Export designs as images
- [ ] Upload custom images for art
- [ ] 3D view of the alley
- [ ] Cost estimation for implementations
- [ ] Community voting on designs
- [ ] Integration with city planning tools
- [ ] Mobile app version
- [ ] AR preview using phone camera

## 🤝 Contributing

This is a community-driven project! Suggestions for improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available for community use.

## 🙏 Acknowledgments

Built to empower LA communities to transform their urban spaces through collaborative design. Inspired by the creative spirit of Los Angeles neighborhoods from Echo Park to Venice Beach.

## 🎨 Design System

See [DESIGN_GUIDE.md](DESIGN_GUIDE.md) for complete design specifications including:
- LA-inspired color palette (Coral Red, Golden Amber, Sky Blue)
- Typography system (Inter & Outfit fonts)
- Component library and interaction patterns
- Accessibility guidelines

---

**Made with ❤️ for LA's community-driven urban transformation**  
🌸 Alley Bloom - Where neighborhoods bloom together
