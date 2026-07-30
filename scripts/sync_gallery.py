#!/usr/bin/env python3
"""
Sync docs/photos.json with the contents of docs/images/.

Run this after adding or removing photo files in docs/images/, then commit
docs/photos.json along with the image changes. The website reads
docs/photos.json at load time to build the photo gallery, so this file is
the only thing that needs to change for the site to pick up new photos.

Usage:
    python3 scripts/sync_gallery.py

What it does:
  - Adds an entry for any new image file found in docs/images/ (with a
    placeholder alt text guessed from the filename -- edit docs/photos.json
    afterward to write a better caption if you want one).
  - Removes entries for any image file that no longer exists in docs/images/.
  - Leaves existing entries (and their alt text / order) untouched.
  - Never touches the two hero photos used in the page header, since those
    are wired up separately in index.html.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "docs" / "images"
MANIFEST_PATH = ROOT / "docs" / "photos.json"

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}


def guess_alt(filename: str) -> str:
    """Produce a reasonable-effort caption from a filename."""
    stem = Path(filename).stem
    # Filenames like IMG_1234, Unknown, Unknown-2, DSC00456 etc. carry no
    # useful information -- fall back to a generic caption.
    if re.fullmatch(r"(IMG|DSC|Unknown|Photo)[\s_-]?\d*", stem, flags=re.IGNORECASE):
        return "Bob and Karen McClennen family photo"
    words = re.sub(r"[-_]+", " ", stem).strip()
    return words[:1].upper() + words[1:] if words else "Bob and Karen McClennen family photo"


def main():
    if not IMAGES_DIR.is_dir():
        print(f"error: {IMAGES_DIR} not found", file=sys.stderr)
        sys.exit(1)

    existing = []
    if MANIFEST_PATH.exists():
        existing = json.loads(MANIFEST_PATH.read_text())

    existing_by_file = {entry["file"]: entry for entry in existing}

    on_disk = sorted(
        p.name for p in IMAGES_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    )
    on_disk_set = set(on_disk)

    # Keep existing entries (with their alt text) that still exist on disk,
    # preserving their current order.
    updated = [entry for entry in existing if entry["file"] in on_disk_set]
    kept_files = {entry["file"] for entry in updated}

    # Append any new files, in alphabetical order, at the end.
    added = []
    for filename in on_disk:
        if filename not in kept_files:
            entry = {"file": filename, "alt": guess_alt(filename)}
            updated.append(entry)
            added.append(filename)

    removed = [f for f in existing_by_file if f not in on_disk_set]

    MANIFEST_PATH.write_text(json.dumps(updated, indent=2) + "\n")

    if added:
        print("Added to gallery:")
        for f in added:
            print(f"  + {f}  (alt: {guess_alt(f)!r} -- edit docs/photos.json to improve)")
    if removed:
        print("Removed from gallery (file no longer in docs/images/):")
        for f in removed:
            print(f"  - {f}")
    if not added and not removed:
        print("No changes -- docs/photos.json already matches docs/images/.")


if __name__ == "__main__":
    main()
