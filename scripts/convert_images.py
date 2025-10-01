import os
from pathlib import Path
from PIL import Image
import pillow_avif # Import the plugin to enable AVIF support

# --- Configuration ---
# The target directory is '../public/images/' relative to where the script is run.
# This assumes your script is one level above 'public' (e.g., in the project root).
TARGET_DIR = Path('..') / 'public' / 'images'

# Conversion quality (0 to 100, 90 is a good balance for web)
JPEG_QUALITY = 90
WEBP_QUALITY = 90

def convert_avif_batch():
    """
    Finds all .avif files in the TARGET_DIR and converts them to .jpg and .webp.
    Saves the new files in the same directory.
    """
    print(f"Starting AVIF conversion in directory: {TARGET_DIR.resolve()}")
    
    if not TARGET_DIR.is_dir():
        print(f"Error: Directory not found at {TARGET_DIR.resolve()}")
        return

    # Use glob to find all files ending with .avif (case-insensitive)
    avif_files = list(TARGET_DIR.glob('*.avif')) + list(TARGET_DIR.glob('*.AVIF'))

    if not avif_files:
        print("No .avif files found to convert.")
        return

    print(f"Found {len(avif_files)} AVIF files.")

    for avif_path in avif_files:
        try:
            # 1. Open the AVIF file
            img = Image.open(avif_path)
            
            # The .jpg format (JPEG) does not support alpha (transparency).
            # We convert to 'RGB' to handle potential transparency in the AVIF file,
            # which usually results in a white background for the JPG.
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Get the new base filename (without extension)
            base_name = avif_path.stem
            
            # 2. Save as JPG (skip if already exists)
            jpg_path = avif_path.with_name(f"{base_name}.jpg")
            if jpg_path.exists():
                print(f"  Skipping JPG (already exists): {jpg_path.name}")
            else:
                img.save(jpg_path, 'jpeg', quality=JPEG_QUALITY)
                print(f"  Converted to JPG: {jpg_path.name}")

            # 3. Save as WebP (skip if already exists)
            webp_path = avif_path.with_name(f"{base_name}.webp")
            # WebP supports lossy/lossless and often better compression than JPEG
            if webp_path.exists():
                print(f"  Skipping WebP (already exists): {webp_path.name}")
            else:
                img.save(webp_path, 'webp', quality=WEBP_QUALITY)
                print(f"  Converted to WebP: {webp_path.name}")
            
        except Exception as e:
            print(f"  Error converting {avif_path.name}: {e}")

    print("\nBatch conversion complete. 🎉")

if __name__ == "__main__":
    convert_avif_batch()