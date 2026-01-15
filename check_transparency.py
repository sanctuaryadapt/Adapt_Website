
from PIL import Image
import sys

try:
    img = Image.open("app/icon.png")
    if img.mode != 'RGBA':
        print("Mode is not RGBA (No transparency)")
        sys.exit(0)
    
    # Check corners for transparency
    corners = [(0,0), (0, img.height-1), (img.width-1, 0), (img.width-1, img.height-1)]
    transparent = True
    for x,y in corners:
        pixel = img.getpixel((x,y))
        if pixel[3] != 0:
            print(f"Corner ({x},{y}) is not transparent: {pixel}")
            transparent = False
    
    if transparent:
        print("Image appears to have transparent corners.")
    else:
        print("Image content is NOT fully transparent at corners.")

except Exception as e:
    print(f"Error: {e}")
