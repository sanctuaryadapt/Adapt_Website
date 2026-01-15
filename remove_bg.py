
from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    # Sample background color from top-left corner
    bg_color = img.getpixel((0, 0))
    threshold = 30  # Tolerance for color matching

    new_data = []
    for item in datas:
        # Check if pixel is close to background color
        if all(abs(item[i] - bg_color[i]) < threshold for i in range(3)):
            new_data.append((255, 255, 255, 0))  # Transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

remove_background("public/AdaptLogo_Transparent.png", "app/icon.png")
