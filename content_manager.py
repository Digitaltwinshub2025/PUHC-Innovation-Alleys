"""
Content Manager for Edit Mode
Reads and writes JSON content files from the /content directory.
All saves are atomic (write to temp, then rename) to prevent partial writes.
"""
import json
import os
import tempfile
import shutil
from datetime import datetime


class ContentManager:
    def __init__(self, content_dir=None):
        if content_dir is None:
            content_dir = os.path.join(os.path.dirname(__file__), 'content')
        self.content_dir = content_dir

    def _resolve_path(self, category, filename):
        """Resolve a content file path. Returns None if path escapes content_dir."""
        safe_category = os.path.basename(category)
        safe_filename = os.path.basename(filename)
        if not safe_filename.endswith('.json'):
            safe_filename += '.json'
        path = os.path.join(self.content_dir, safe_category, safe_filename)
        # Prevent directory traversal
        real_path = os.path.realpath(path)
        real_content = os.path.realpath(self.content_dir)
        if not real_path.startswith(real_content):
            return None
        return path

    def read(self, category, filename):
        """Read a content JSON file. Returns dict or None if not found."""
        path = self._resolve_path(category, filename)
        if path is None:
            return None
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None

    def write(self, category, filename, data):
        """
        Atomically write a content JSON file.
        Writes to a temp file first, then renames to prevent partial writes.
        Returns True on success, raises on failure.
        """
        path = self._resolve_path(category, filename)
        if path is None:
            raise ValueError("Invalid content path")

        # Stamp the edit time
        if isinstance(data, dict) and '_meta' in data:
            data['_meta']['last_edited'] = datetime.utcnow().isoformat()

        # Ensure directory exists
        os.makedirs(os.path.dirname(path), exist_ok=True)

        # Atomic write: temp file in same directory, then rename
        dir_name = os.path.dirname(path)
        fd, tmp_path = tempfile.mkstemp(suffix='.json', dir=dir_name)
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            # On Windows, we need to remove target first if it exists
            if os.path.exists(path):
                os.replace(tmp_path, path)
            else:
                os.rename(tmp_path, path)
        except Exception:
            # Clean up temp file on failure
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            raise

        return True

    def list_files(self, category):
        """List all JSON files in a content category."""
        safe_category = os.path.basename(category)
        cat_dir = os.path.join(self.content_dir, safe_category)
        if not os.path.isdir(cat_dir):
            return []
        return [f[:-5] for f in os.listdir(cat_dir) if f.endswith('.json')]

    def load_page_content(self, page_name):
        """Convenience: load a page content file from /content/pages/."""
        return self.read('pages', page_name)

    def load_area_content(self, area_name):
        """Convenience: load an area content file from /content/areas/."""
        return self.read('areas', area_name)

    def load_theme(self, theme_file):
        """Convenience: load a theme file from /content/theme/."""
        return self.read('theme', theme_file)

    def load_media_captions(self):
        """Convenience: load media captions."""
        return self.read('media', 'captions')


content_manager = ContentManager()
