import os
from pathlib import Path
from PIL import Image
import pillow_avif  # Import the plugin to enable AVIF support
import argparse
import sys

# --- Configuration ---
# The target directory is the project's `public/images` directory.
# We compute it relative to this script file so the script works when run
# from any working directory.
SCRIPT_DIR = Path(__file__).resolve().parent
TARGET_DIR = SCRIPT_DIR.parent / 'public' / 'images'

# Conversion quality (0 to 100, 90 is a good balance for web)
JPEG_QUALITY = 90
WEBP_QUALITY = 90
AVIF_QUALITY = 50

SUPPORTED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif']


def find_image_stems(directory: Path):
    """Return a dict mapping stem -> list of Path objects for supported images."""
    stems = {}
    for ext in SUPPORTED_EXT:
        for p in directory.glob(f'*{ext}'):
            stems.setdefault(p.stem, []).append(p)
    return stems


def load_best_image(paths):
    """Given a list of image Paths for the same stem, pick one to load as source.

    Preference order: avif -> webp -> png -> jpg/jpeg
    Returns (PIL.Image, source_path)
    """
    # Normalize extension order
    order = ['.avif', '.webp', '.png', '.jpg', '.jpeg']
    pick = None
    for ext in order:
        for p in paths:
            if p.suffix.lower() == ext:
                pick = p
                break
        if pick:
            break

    if not pick:
        # Fallback to first
        pick = paths[0]

    img = Image.open(pick)
    return img, pick


def ensure_variants(stem: str, paths: list, directory: Path, dry_run=False):
    """Ensure .jpg, .webp and .avif exist for the given stem. Convert from best source if missing."""
    wanted = {
        '.jpg': directory / f'{stem}.jpg',
        '.webp': directory / f'{stem}.webp',
        '.avif': directory / f'{stem}.avif',
    }

    existing = {p.suffix.lower(): p for p in paths}

    # If all present, nothing to do
    if all(w.exists() for w in wanted.values()):
        print(f"  All variants exist for: {stem}")
        return

    # Load best available source
    try:
        img, src_path = load_best_image(paths)
    except Exception as e:
        print(f"  Error opening source for {stem}: {e}")
        return

    # Convert alpha images to RGB for formats that don't support alpha
    def prepare_for_save(image, target_ext):
        im = image
        if target_ext == '.jpg' and im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGB')
        # WebP and AVIF support alpha; keep as-is
        return im

    # Ensure JPG
    jpg_path = wanted['.jpg']
    if not jpg_path.exists():
        im_to_save = prepare_for_save(img, '.jpg')
        print(f"  Creating JPG from {src_path.name} -> {jpg_path.name}")
        if not dry_run:
            try:
                im_to_save.save(jpg_path, 'JPEG', quality=JPEG_QUALITY)
            except Exception as e:
                print(f"    Failed to save JPG for {stem}: {e}")

    # Ensure WebP
    webp_path = wanted['.webp']
    if not webp_path.exists():
        im_to_save = prepare_for_save(img, '.webp')
        print(f"  Creating WebP from {src_path.name} -> {webp_path.name}")
        if not dry_run:
            try:
                im_to_save.save(webp_path, 'WEBP', quality=WEBP_QUALITY)
            except Exception as e:
                print(f"    Failed to save WebP for {stem}: {e}")

    # Ensure AVIF
    avif_path = wanted['.avif']
    if not avif_path.exists():
        im_to_save = prepare_for_save(img, '.avif')
        print(f"  Creating AVIF from {src_path.name} -> {avif_path.name}")
        if not dry_run:
            try:
                # pillow-avif-plugin exposes AVIF support through 'avif' format
                im_to_save.save(avif_path, 'AVIF', quality=AVIF_QUALITY)
            except Exception as e:
                print(f"    Failed to save AVIF for {stem}: {e}")


def ensure_all_variants(target_dir: Path, dry_run=False):
    print(f"Scanning images in: {target_dir.resolve()}")
    if not target_dir.is_dir():
        print(f"Error: Directory not found at {target_dir.resolve()}")
        return

    stems = find_image_stems(target_dir)
    if not stems:
        print("No supported images found.")
        return

    print(f"Found {len(stems)} image stems to check.")

    for stem, paths in sorted(stems.items()):
        print(f"Processing: {stem} (found: {', '.join(p.name for p in paths)})")
        ensure_variants(stem, paths, target_dir, dry_run=dry_run)


def main(argv=None):
    parser = argparse.ArgumentParser(description='Ensure jpg, webp and avif variants for images in public/images')
    parser.add_argument('--target', '-t', type=str, default=str(TARGET_DIR), help='Target images directory')
    parser.add_argument('--dry-run', action='store_true', help='Do not write files; just print actions')
    args = parser.parse_args(argv)

    td = Path(args.target)
    ensure_all_variants(td, dry_run=args.dry_run)


if __name__ == '__main__':
    main()