# image_processor_v2.py

import os
import subprocess
import json
from PIL import Image

# Import the rich library for beautiful CLI output
from rich.console import Console
from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn
from rich.panel import Panel

# --- Main Configuration ---
INPUT_DIR = "./images_original/chosen"
OUTPUT_DIR = "./public/images"
VALID_EXTENSIONS = ('.png', '.jpg', '.jpeg')

# --- Full-Size Image Settings ---
# Percentage to resize full-size images to (e.g., 50 means 50% of original size).
RESIZE_PERCENTAGE = 50

# --- Thumbnail Settings ---
# Set to True to generate thumbnails, False to skip them.
GENERATE_THUMBS = True
# Percentage to resize thumbnails to.
THUMB_RESIZE_PERCENTAGE = 10
# Suffix to add to the thumbnail filename (e.g., image.jpg -> image_thumb.webp).
THUMB_SUFFIX = "_thumb"

# --- Squoosh Encoder Settings (@frostoven/squoosh-cli) ---
# Detailed configuration for the WebP encoder.
WEBP_CONFIG = {
    "quality": 75, "target_size": 0, "target_PSNR": 0, "method": 4,
    "sns_strength": 50, "filter_strength": 60, "filter_sharpness": 0,
    "filter_type": 1, "partitions": 0, "segments": 4, "pass": 1,
    "show_compressed": 0, "preprocessing": 0, "autofilter": 0,
    "partition_limit": 0, "alpha_compression": 0, "alpha_filtering": 1,
    "alpha_quality": 100, "lossless": 0, "exact": 0, "image_hint": 0,
    "emulate_jpeg_size": 0, "thread_level": 0, "low_memory": 0,
    "near_lossless": 100, "use_delta_palette": 0, "use_sharp_yuv": 0
}

# Detailed configuration for the AVIF encoder.
AVIF_CONFIG = {
    "cqLevel": 38, "cqAlphaLevel": -1, "subsample": 1, "tileColsLog2": 0,
    "tileRowsLog2": 0, "speed": 6, "chromaDeltaQ": False, "sharpness": 0,
    "denoiseLevel": 0, "tune": 0
}
# --- End of Configuration ---

# Initialize Rich console
console = Console()

def get_image_dimensions(image_path):
    """Gets the width and height of an image."""
    try:
        with Image.open(image_path) as img:
            return img.size
    except Exception as e:
        console.print(f"❌ [bold red]Error reading {os.path.basename(image_path)}:[/bold red] {e}")
        return None, None

def create_resize_json(width, height, percentage):
    """Creates the JSON string for Squoosh's resize option."""
    new_width = int(width * (percentage / 100))
    new_height = int(height * (percentage / 100))
    resize_config = {
        "enabled": True, "width": new_width, "height": new_height,
        "method": "lanczos3", "fitMethod": "stretch", "premultiply": True, "linearRGB": True
    }
    return json.dumps(resize_config)

def run_squoosh_command(command, filename):
    """Executes a Squoosh CLI command and handles errors."""
    try:
        a=subprocess.run(command, check=True, capture_output=True, text=True)
        print("".join(command))
        exit()
        return True
    except subprocess.CalledProcessError as e:
        console.print(f"❌ [bold red]Squoosh error on {filename}:[/bold red]")
        console.print(e.stderr, style="dim")
        return False
    except FileNotFoundError:
        console.print("❌ [bold red]Error: 'npx' command not found.[/bold red]")
        console.print("Please ensure Node.js and npm are installed and in your system's PATH.")
        return False

def process_images():
    """Finds and processes all images using Squoosh and Rich for progress."""
    if not os.path.exists(INPUT_DIR) or not os.listdir(INPUT_DIR):
        console.print(Panel(f"[bold yellow]Your input folder '{INPUT_DIR}' is empty or missing.[/bold yellow]\nPlease add images and run the script again.", title="[bold]Warning[/bold]", border_style="yellow"))
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    image_files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(VALID_EXTENSIONS)]

    if not image_files:
        console.print(f"🤷 [yellow]No images with extensions {VALID_EXTENSIONS} found in '{INPUT_DIR}'.[/yellow]")
        return

    console.print(Panel(f"Found [bold cyan]{len(image_files)}[/bold cyan] images. Starting processing...", title="[bold]Image Optimizer[/bold]", border_style="green"))

    with Progress(
        TextColumn("[bold cyan]{task.description}", justify="right"),
        BarColumn(bar_width=None),
        "[progress.percentage]{task.percentage:>3.0f}%",
        TimeRemainingColumn(),
        console=console
    ) as progress:
        task = progress.add_task("[green]Processing...", total=len(image_files))

        for filename in image_files:
            progress.update(task, description=f"Processing [bold]{filename}[/bold]")
            input_path = os.path.join(INPUT_DIR, filename)
            original_width, original_height = get_image_dimensions(input_path)
            if not original_width:
                progress.advance(task)
                continue

            # --- 1. Process Full-Size Images (WebP + AVIF) ---
            resize_json_full = create_resize_json(original_width, original_height, RESIZE_PERCENTAGE)
            command_full = [
                "npx", "@frostoven/squoosh-cli",
                "--resize", resize_json_full,
                "--webp", json.dumps(WEBP_CONFIG),
                "--avif", json.dumps(AVIF_CONFIG),
                "-d", OUTPUT_DIR,
                input_path
            ]
            if not run_squoosh_command(command_full, filename):
                progress.advance(task)
                continue # Skip to next file on error

            # --- 2. Process Thumbnail Image (WebP only) ---
            if GENERATE_THUMBS:
                resize_json_thumb = create_resize_json(original_width, original_height, THUMB_RESIZE_PERCENTAGE)
                command_thumb = [
                    "npx", "@frostoven/squoosh-cli",
                    "--resize", resize_json_thumb,
                    "--webp", json.dumps(WEBP_CONFIG),
                    "--suffix", THUMB_SUFFIX,
                    "-d", OUTPUT_DIR,
                    input_path
                ]
                run_squoosh_command(command_thumb, f"{filename} (thumb)")

            progress.advance(task)

    console.print(Panel("🎉 [bold green]All images processed successfully![/bold green]", title="[bold]Complete[/bold]", border_style="green"))

if __name__ == "__main__":
    process_images()