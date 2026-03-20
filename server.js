const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const BASE_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Route mapping: Flask routes to template files
const routeMap = {
  '/': '/templates/index_unified.html',
  '/index': '/templates/index_unified.html',
  '/visualization-studio': '/templates/visualization_studio.html',
  '/street-view-designer': '/templates/visualization_studio.html',
  '/before-after': '/templates/before_after.html',
  '/design-workspace': '/templates/design_workspace.html',
  '/design-brief': '/templates/design_brief.html',
  '/scenarios': '/templates/scenarios.html',
  '/live-dashboard': '/templates/live_dashboard.html',
  '/plant-library': '/templates/plant_library.html',
  '/innovation-alleys-map': '/templates/innovation_alleys_map.html',
  '/unreal-viewer': '/templates/unreal_viewer.html',
  '/digital-twin': '/templates/unreal_viewer.html'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Check route map first
  if (routeMap[pathname]) {
    pathname = routeMap[pathname];
  }

  let filePath = path.join(BASE_DIR, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Try with .html extension if not found
      if (!filePath.endsWith('.html')) {
        filePath = filePath + '.html';
        fs.stat(filePath, (err2, stats2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - File not found');
            return;
          }
          serveFile(filePath, res);
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - File not found');
      }
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (err, stats) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - File not found');
          return;
        }
        serveFile(filePath, res);
      });
    } else {
      serveFile(filePath, res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 - Internal Server Error');
      return;
    }

    // Process HTML files to replace Flask template syntax
    if (ext === '.html') {
      data = processTemplates(data);
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function processTemplates(content) {
  // Replace {{ url_for('static', filename='...') }} with /static/...
  content = content.replace(/\{\{\s*url_for\s*\(\s*['"]static['"]\s*,\s*filename\s*=\s*['"]([^'"]+)['"]\s*\)\s*\}\}/g, '/static/$1');
  
  // Replace other common Flask template patterns
  content = content.replace(/\{\{\s*url_for\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\}\}/g, '/$1');
  
  return content;
}

server.listen(PORT, () => {
  console.log('\n🎨 Alley Bloom Development Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log('\n📁 Main pages:');
  console.log(`  → http://localhost:${PORT}                          (Home)`);
  console.log(`  → http://localhost:${PORT}/templates/visualization_studio.html  (Street View)`);
  console.log(`  → http://localhost:${PORT}/templates/before_after.html          (Before & After)`);
  console.log(`  → http://localhost:${PORT}/templates/design_workspace.html      (Design Studio)`);
  console.log(`  → http://localhost:${PORT}/templates/scenarios.html             (Scenarios)`);
  console.log(`  → http://localhost:${PORT}/templates/live_dashboard.html        (Dashboard)`);
  console.log(`  → http://localhost:${PORT}/templates/plant_library.html         (Plant Library)`);
  console.log(`  → http://localhost:${PORT}/templates/innovation_alleys_map.html (Map)`);
  console.log(`  → http://localhost:${PORT}/templates/unreal_viewer.html         (3D Viewer)`);
  console.log('\n⏹️  Press Ctrl+C to stop the server\n');
});
