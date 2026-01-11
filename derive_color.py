from PIL import Image
from collections import Counter

def get_dominant_color(image_path):
    try:
        img = Image.open(image_path)
        img = img.resize((50, 50))  # Resize to speed up
        img = img.convert('RGB')
        pixels = list(img.getdata())
        
        # Filter out whites/near-whites and blacks/near-blacks to find the actual "brand" color
        filtered_pixels = [
            p for p in pixels 
            if not (p[0] > 240 and p[1] > 240 and p[2] > 240) # Ignore White
            and not (p[0] < 15 and p[1] < 15 and p[2] < 15)   # Ignore Black
        ]
        
        if not filtered_pixels:
            return "No dominant color found (only b/w)"

        counts = Counter(filtered_pixels)
        dominant = counts.most_common(1)[0][0]
        return '#{:02x}{:02x}{:02x}'.format(*dominant)
        
    except Exception as e:
        return str(e)

print(get_dominant_color('/home/xanta/Adapt_Automation/public/assets/pics/AdaptLogo.jpg'))
