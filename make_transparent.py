from PIL import Image
import numpy as np

def remove_background(input_path, output_path, bg_color='black', tolerance=30):
    """
    Remove background from image and make it transparent
    
    Args:
        input_path: Path to input image
        output_path: Path to save transparent image
        bg_color: 'black' or 'white' or 'gray'
        tolerance: Color tolerance for background removal (0-255)
    """
    # Open image
    img = Image.open(input_path).convert('RGBA')
    data = np.array(img)
    
    # Get RGB channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Define background color ranges
    if bg_color == 'black':
        # Remove black and very dark colors
        mask = (r < tolerance) & (g < tolerance) & (b < tolerance)
    elif bg_color == 'white':
        # Remove white and very light colors
        mask = (r > 255-tolerance) & (g > 255-tolerance) & (b > 255-tolerance)
    elif bg_color == 'gray':
        # Remove gray backgrounds (light gray)
        # Check if RGB values are similar (grayscale) and light
        gray_check = (abs(r - g) < 20) & (abs(g - b) < 20) & (abs(r - b) < 20)
        light_check = (r > 180) & (g > 180) & (b > 180)
        mask = gray_check & light_check
    
    # Set alpha channel to 0 (transparent) where mask is True
    data[:,:,3] = np.where(mask, 0, a)
    
    # Create new image
    result = Image.fromarray(data, 'RGBA')
    
    # Save as PNG
    result.save(output_path, 'PNG')
    print(f"✓ Created transparent image: {output_path}")

# Process Planter 4 (black background)
print("Processing Planter 4...")
remove_background(
    r"C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\2d Planter 4 image 4.png",
    r"static\images\urban-farming-object-4.png",
    bg_color='black',
    tolerance=40
)

# Process All Planters Concept (gray background)
print("Processing All Planters Concept...")
remove_background(
    r"C:\Users\MLee7\Desktop\PUHC NEW IMAGES TO ADD TO WEBSITE\All planters together concept reference.png",
    r"static\images\urban-farming-all-planters-concept.png",
    bg_color='gray',
    tolerance=30
)

print("\n✓ All images processed successfully!")
print("Files created:")
print("  - static/images/urban-farming-object-4.png")
print("  - static/images/urban-farming-all-planters-concept.png")
