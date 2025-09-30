# process_images.py

import os
from pathlib import Path
from PIL import Image

# For beautiful terminal output
from rich.console import Console
from rich.progress import Progress
from rich.panel import Panel
from rich.table import Table

# --- CONFIGURATION ---
# Adjust these settings to your needs
CONFIG = {
    "input_dir": "./images_original/chosen",
    "output_dir": "./public/images",
    "resize_percentages": [75, 50, 25],  # e.g., 75%, 50%, 25% of original size
    "thumb_percentage": 10,  # 10% size for thumbnails
    "webp_quality": 70,      # Quality for WebP images (0-100)
    "avif_quality": 60,      # Quality for AVIF images (0-100, lower is better but smaller)
    "avif_speed": 6          # AVIF encoding speed (0-10, 10 is fastest but lower quality)
}
# --- END CONFIGURATION ---

# Initialize Rich console for beautiful printing
console = Console()

def create_output_dirs(base_path, subdirs):
    """Creates the output directories if they don't exist."""
    Path(base_path).mkdir(exist_ok=True)
    for subdir in subdirs:
        Path(os.path.join(base_path, subdir)).mkdir(exist_ok=True)

def process_image(file_path, progress, task_id):
    """
    Processes a single image: resizes it, creates WebP/AVIF variants, and a thumbnail.
    """
    try:
        with Image.open(file_path) as img:
            original_width, original_height = img.size
            file_stem = Path(file_path).stem # Filename without extension

            # 1. Generate Thumbnail (_thumb.webp)
            thumb_width = int(original_width * (CONFIG["thumb_percentage"] / 100))
            thumb_height = int(original_height * (CONFIG["thumb_percentage"] / 100))
            thumb_img = img.resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)

            thumb_filename = f"{file_stem}_thumb.webp"
            thumb_save_path = os.path.join(CONFIG["output_dir"], "webp", thumb_filename)
            thumb_img.save(thumb_save_path, "webp", quality=CONFIG["webp_quality"])

            # 2. Generate Resized WebP and AVIF variants
            for percent in CONFIG["resize_percentages"]:
                new_width = int(original_width * (percent / 100))
                new_height = int(original_height * (percent / 100))

                # Suffix for the filename, e.g., _75
                size_suffix = f"_{percent}"

                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

                # Save as WebP
                webp_filename = f"{file_stem}{size_suffix}.webp"
                webp_save_path = os.path.join(CONFIG["output_dir"], "webp", webp_filename)
                resized_img.save(webp_save_path, "webp", quality=CONFIG["webp_quality"])

                # Save as AVIF
                avif_filename = f"{file_stem}{size_suffix}.avif"
                avif_save_path = os.path.join(CONFIG["output_dir"], "avif", avif_filename)
                # AVIF uses different parameters: `quality` (lower is better) and `speed`
                resized_img.save(avif_save_path, "avif", quality=CONFIG["avif_quality"], speed=CONFIG["avif_speed"])

    except Exception as e:
        console.print(f"[bold red]Error processing {file_path.name}: {e}[/bold red]")
    finally:
        progress.update(task_id, advance=1)


def main():
    """Main function to run the image processing script."""
    console.print(Panel.fit("[bold cyan]🖼️  Image Variant Generator[/bold cyan]", border_style="green"))

    input_dir = Path(CONFIG["input_dir"])
    output_dir = Path(CONFIG["output_dir"])

    if not input_dir.is_dir():
        console.print(f"[bold red]Error: Input directory '{input_dir}' not found.[/bold red]")
        return

    # Find all supported image files
    image_files = [
        p for p in input_dir.iterdir()
        if p.suffix.lower() in ['.jpg', '.jpeg', '.png']
    ]

    if not image_files:
        console.print(f"[yellow]No images found in '{input_dir}'.[/yellow]")
        return

    # Create output subdirectories
    create_output_dirs(output_dir, ["webp", "avif"])

    # Display configuration
    table = Table(title="Script Configuration")
    table.add_column("Setting", style="magenta")
    table.add_column("Value", style="cyan")
    for key, value in CONFIG.items():
        table.add_row(key, str(value))
    console.print(table)


    # Process images with a progress bar
    with Progress(console=console) as progress:
        task = progress.add_task("[green]Processing images...", total=len(image_files))
        for file_path in image_files:
            process_image(file_path, progress, task)

    console.print(f"\n[bold green]✅ Success![/bold green] All images processed.")
    console.print(f"Find your optimized images in the '[bold]{output_dir}[/bold]' folder.")


if __name__ == "__main__":
    main()