"""
Consolidate all navbar implementations into a single shared include
Replaces duplicated navbar HTML with {% include 'includes/navbar.html' %}
"""

import os
import re

# Templates to update (excluding index_unified.html which already has the correct navbar)
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

def replace_navbar(content):
    """Replace navbar HTML with include statement"""
    
    # Pattern to match the entire navbar block
    # Matches from <!-- Global Navigation --> or <nav class="global-nav"> to </nav>
    patterns = [
        # Pattern 1: With comment
        r'<!-- Global Navigation -->\s*<nav class="global-nav">.*?</nav>',
        # Pattern 2: Without comment
        r'<nav class="global-nav">.*?</nav>'
    ]
    
    replacement = "{% include 'includes/navbar.html' %}"
    
    for pattern in patterns:
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            return content, True
    
    return content, False

def process_template(filepath):
    """Process a single template file"""
    print(f"Processing {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already using include
        if "{% include 'includes/navbar.html' %}" in content:
            print(f"  ✓ Already using navbar include\n")
            return True
        
        # Replace navbar
        new_content, replaced = replace_navbar(content)
        
        if replaced:
            # Write back
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  ✓ Replaced navbar with include\n")
            return True
        else:
            print(f"  ✗ Could not find navbar to replace\n")
            return False
        
    except Exception as e:
        print(f"  ✗ Error: {e}\n")
        return False

def main():
    print("=" * 60)
    print("NAVBAR CONSOLIDATION - Replace with Shared Include")
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
    print()
    print("All pages now use: {% include 'includes/navbar.html' %}")
    print("Navbar is centralized in: templates/includes/navbar.html")

if __name__ == '__main__':
    main()
