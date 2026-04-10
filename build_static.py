import os
import shutil
from app import app
from flask import url_for

def build_static_site():
    """Generate static HTML files from Flask templates"""
    
    output_dir = 'docs'
    
    # Clear existing docs folder
    if os.path.exists(output_dir):
        for item in os.listdir(output_dir):
            item_path = os.path.join(output_dir, item)
            if os.path.isfile(item_path):
                os.remove(item_path)
            elif os.path.isdir(item_path) and item not in ['static', 'content']:
                shutil.rmtree(item_path)
    else:
        os.makedirs(output_dir)
    
    # Copy static files
    if os.path.exists('static'):
        static_dest = os.path.join(output_dir, 'static')
        if os.path.exists(static_dest):
            shutil.rmtree(static_dest)
        shutil.copytree('static', static_dest)
    
    # Copy content files
    if os.path.exists('content'):
        content_dest = os.path.join(output_dir, 'content')
        if os.path.exists(content_dest):
            shutil.rmtree(content_dest)
        shutil.copytree('content', content_dest)
    
    # Routes to generate - UPDATED to match current app.py routes
    routes = [
        ('/', 'index.html'),
        ('/existing', 'existing.html'),
        ('/compare', 'compare.html'),
        ('/urban-farming', 'urban-farming.html'),
        ('/solar-shades', 'solar-shades.html'),
        ('/murals', 'murals.html'),
        ('/unreal-viewer', 'unreal-viewer.html'),
        ('/innovation-alleys-map', 'innovation-alleys-map.html'),
        ('/puhc-puede', 'puhc-puede.html'),
        ('/aura-report', 'aura-report.html'),
    ]
    
    with app.test_client() as client:
        for route, filename in routes:
            try:
                print(f"Generating {filename}...")
                response = client.get(route)
                
                if response.status_code == 200:
                    html_content = response.data.decode('utf-8')
                    
                    # Fix asset paths for static site
                    html_content = html_content.replace('href="/', 'href="')
                    html_content = html_content.replace('src="/', 'src="')
                    html_content = html_content.replace('url(/', 'url(')
                    html_content = html_content.replace('="/static/', '="static/')
                    html_content = html_content.replace('="/content/', '="content/')
                    
                    # Fix navigation links for static site
                    html_content = html_content.replace('href="/"', 'href="index.html"')
                    html_content = html_content.replace('href=""', 'href="index.html"')
                    html_content = html_content.replace('href="/existing"', 'href="existing.html"')
                    html_content = html_content.replace('href="/compare"', 'href="compare.html"')
                    html_content = html_content.replace('href="/urban-farming"', 'href="urban-farming.html"')
                    html_content = html_content.replace('href="/solar-shades"', 'href="solar-shades.html"')
                    html_content = html_content.replace('href="/murals"', 'href="murals.html"')
                    html_content = html_content.replace('href="/unreal-viewer"', 'href="unreal-viewer.html"')
                    html_content = html_content.replace('href="/digital-twin"', 'href="unreal-viewer.html"')
                    html_content = html_content.replace('href="/innovation-alleys-map"', 'href="innovation-alleys-map.html"')
                    html_content = html_content.replace('href="/puhc-puede"', 'href="puhc-puede.html"')
                    html_content = html_content.replace('href="/aura-report"', 'href="aura-report.html"')
                    html_content = html_content.replace('href="/fence-map"', 'href="fence-map.html"')
                    html_content = html_content.replace('href="/interactive-fence-map"', 'href="fence-map.html"')
                    
                    output_path = os.path.join(output_dir, filename)
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                    print(f"✓ Created {filename}")
                else:
                    print(f"✗ Failed to generate {filename} (status {response.status_code})")
            except Exception as e:
                print(f"✗ Error generating {filename}: {str(e)}")
    
    # Copy and rename standalone HTML files for GitHub Pages
    # Fence map: rename interactive-fence-map.html to fence-map.html for cleaner URLs
    if os.path.exists('interactive-fence-map.html'):
        shutil.copy('interactive-fence-map.html', os.path.join(output_dir, 'fence-map.html'))
        print(f"✓ Copied interactive-fence-map.html → fence-map.html")
    
    # Rhino viewer
    if os.path.exists('rhino-viewer.html'):
        shutil.copy('rhino-viewer.html', os.path.join(output_dir, 'rhino-viewer.html'))
        print(f"✓ Copied rhino-viewer.html")
    
    print(f"\n✓ Static site built in '{output_dir}/' folder")
    print(f"✓ Ready for GitHub Pages deployment")

if __name__ == '__main__':
    build_static_site()
