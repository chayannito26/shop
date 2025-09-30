# image_optimizer.py

import os
import subprocess
import json
from PIL import Image

# --- Configuration ---
# You can easily change these values to fit your needs.

# Folder for your original images.
INPUT_DIR = "./images_original/chosen"

# Folder where the optimized images will be saved.
OUTPUT_DIR = "./public/images"

# The percentage to resize images to (e.g., 50 means 50% of original size).
RESIZE_PERCENTAGE = 50

# Valid image file extensions to look for.
VALID_EXTENSIONS = ('.png', '.jpg', '.jpeg')

# --- End of Configuration ---


def create_directory_if_not_exists(directory):
    """Creates a directory if it doesn't already exist."""
    if not os.path.exists(directory):
        print(f"Creating output directory: {directory} 📁")
        os.makedirs(directory)

def get_new_dimensions(image_path, percentage):
    """Calculates new image dimensions based on a percentage."""
    try:
        with Image.open(image_path) as img:
            original_width, original_height = img.size
            new_width = int(original_width * (percentage / 100))
            new_height = int(original_height * (percentage / 100))
            return new_width, new_height
    except Exception as e:
        print(f"❌ Could not read image dimensions from {image_path}: {e}")
        return None, None

def process_images():
    """
    Finds images in the input directory and processes them using the Squoosh CLI
    to resize and generate WebP and AVIF versions.
    """
    print("--- Starting Image Processing Script --- ✨")
    create_directory_if_not_exists(OUTPUT_DIR)

    try:
        image_files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(VALID_EXTENSIONS)]
    except FileNotFoundError:
        print(f"❌ Error: Input directory '{INPUT_DIR}' not found.")
        print("Please create it and add your images before running the script.")
        return

    if not image_files:
        print(f"🤷 No images with extensions {VALID_EXTENSIONS} found in '{INPUT_DIR}'.")
        return

    print(f"Found {len(image_files)} images to process.")

    for filename in image_files:
        input_path = os.path.join(INPUT_DIR, filename)
        print(f"\nProcessing: {filename}...")

        # 1. Calculate new dimensions for resizing
        new_width, new_height = get_new_dimensions(input_path, RESIZE_PERCENTAGE)
        if new_width is None:
            continue

        # 2. Construct the resize configuration JSON for Squoosh CLI
        resize_config = {
            "enabled": True,
            "width": new_width,
            "height": new_height,
            "method": "lanczos3",
            "fitMethod": "stretch",
            "premultiply": True,
            "linearRGB": True,
        }
        resize_json_string = json.dumps(resize_config)

        # 3. Build the full Squoosh CLI command
        command = [
            "npx", "@squoosh/cli",
            "--resize", resize_json_string,
            "--webp", "auto",  # Generate WebP with auto quality
            "--avif", "auto",  # Generate AVIF with auto quality
            "-d", OUTPUT_DIR,  # Set the output directory
            input_path
        ]

        # 4. Execute the command
        try:
            print("Running Squoosh CLI... 🚀")
            subprocess.run(command, check=True, capture_output=True, text=True)
            print(" ".join(command))
            print(f"✅ Successfully processed {filename}.")
        except subprocess.CalledProcessError as e:
            print(f"❌ An error occurred while processing {filename}:")
            print(f"Error Output:\n{e.stderr}")
        except FileNotFoundError:
            print("❌ Error: 'npx' command not found.")
            print("Please ensure Node.js and npm are installed and in your system's PATH.")
            break

    print("\n--- All Done! --- 🎉")

if __name__ == "__main__":
    # Create the input directory if it doesn't exist to guide the user
    if not os.path.exists(INPUT_DIR):
        print(f"Input folder '{INPUT_DIR}' not found. Creating it for you.")
        os.makedirs(INPUT_DIR)
        print(f"Please place your images in the '{INPUT_DIR}' folder and run the script again.")
    else:
        process_images()