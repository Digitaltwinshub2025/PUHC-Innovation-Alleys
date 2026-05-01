"""
Apply navbar fix to all template files
Adds navbar-fix.css and navbar.js to all HTML templates
"""

import os
import re

# Templates to update
templates = [
    'templates/existing_new.html',
    'templates/compare.html',
    'templates/solar_shades.html',
    'templates/murals.html',
    'templates/urban_farming.html',
    'templates/unreal_viewer.html',
    'templates/innovation_alleys_map.html',
    'templates/puhc_puede.html',
    'templates/aura_report.html'
]

def add_navbar_fix_css(content):
    """Add navbar-fix.css after global-theme.css"""
    # Check if already added
    if 'navbar-fix.css' in content:
        # Fix escaped quotes if present
        content = content.replace("url_for(\\'static\\'", "url_for('static'")
        content = content.replace("filename=\\'css/navbar-fix.css\\'", "filename='css/navbar-fix.css'")
        return content
    
    # Pattern 1: With url_for
    pattern1 = r'(<link rel="stylesheet" href="{{ url_for\(\'static\', filename=\'css/global-theme\.css\'\) }}">\n)'
    replacement1 = r'\1    <link rel="stylesheet" href="{{ url_for(\'static\', filename=\'css/navbar-fix.css\') }}">\n'
    
    # Pattern 2: Without url_for
    pattern2 = r'(<link rel="stylesheet" href="/static/css/global-theme\.css">\n)'
    replacement2 = r'\1    <link rel="stylesheet" href="/static/css/navbar-fix.css">\n'
    
    # Try both patterns
    if '{{ url_for' in content:
        content = re.sub(pattern1, replacement1, content)
    else:
        content = re.sub(pattern2, replacement2, content)
    
    return content

def add_navbar_js(content):
    """Add navbar.js before </body>"""
    # Check if already added
    if 'navbar.js' in content:
        # Fix escaped quotes if present
        content = content.replace("url_for(\\'static\\'", "url_for('static'")
        content = content.replace("filename=\\'js/navbar.js\\'", "filename='js/navbar.js'")
        return content
    
    # Pattern: Add before </body>
    pattern = r'(</body>)'
    
    # With url_for
    if '{{ url_for' in content:
        replacement = r'    <script src="{{ url_for(\'static\', filename=\'js/navbar.js\') }}"></script>\n\1'
    else:
        replacement = r'    <script src="/static/js/navbar.js"></script>\n\1'
    
    content = re.sub(pattern, replacement, content)
    
    return content

def process_template(filepath):
    """Process a single template file"""
    print(f"Processing {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already has navbar-fix.css
        if 'navbar-fix.css' in content:
            print(f"  ✓ Already has navbar-fix.css")
        else:
            content = add_navbar_fix_css(content)
            print(f"  ✓ Added navbar-fix.css")
        
        # Check if already has navbar.js
        if 'navbar.js' in content:
            print(f"  ✓ Already has navbar.js")
        else:
            content = add_navbar_js(content)
            print(f"  ✓ Added navbar.js")
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ Complete\n")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}\n")
        return False

def main():
    print("=" * 60)
    print("NAVBAR FIX - Batch Application")
    print("=" * 60)
    print()
    
    success_count = 0
    fail_count = 0
    
    for template in templates:
        if os.path.exists(template):
            if process_template(template):
                success_count += 1
            else:
                fail_count += 1
        else:
            print(f"✗ File not found: {template}\n")
            fail_count += 1
    
    print("=" * 60)
    print(f"COMPLETE: {success_count} success, {fail_count} failed")
    print("=" * 60)

if __name__ == '__main__':
    main()
