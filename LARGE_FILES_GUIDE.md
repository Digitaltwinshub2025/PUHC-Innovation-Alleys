# Large Files Management Guide

## Overview

This project contains large media files (videos and high-resolution images) that are excluded from Git to keep the repository lightweight. Total excluded content: ~500 MB.

## Excluded Files

### Videos (242 MB in static/videos)
- `Puede Center flythrough.mp4` - 224.48 MB
- `Medallion Art show piece.mp4` - 12.44 MB
- `alley3-flythrough-compressed.mp4` - 5.53 MB

### Large Images (over 2MB each)
Located in `static/images/`:
- `jellyfish.png` - 8 MB (medallion design)
- `Building 11 PNG.png` - 3.01 MB
- Various intervention images - 2-3 MB each

### Build Output
- `docs/` folder - Regenerated static site (duplicate of all assets)

## Solutions for Deployment

### Option 1: External Video Hosting (Recommended)

**Use YouTube or Vimeo for videos:**

1. Upload videos to YouTube:
   - Puede Center flythrough
   - Medallion Art showcase
   - Alley 3 flythrough

2. Update HTML to use embedded players:
   ```html
   <iframe src="https://www.youtube.com/embed/VIDEO_ID" 
           width="100%" height="500" frameborder="0" allowfullscreen>
   </iframe>
   ```

3. Benefits:
   - Free hosting
   - Better streaming performance
   - Automatic quality adaptation
   - No GitHub size limits

### Option 2: Git LFS (Large File Storage)

**For files you need in the repository:**

1. Install Git LFS:
   ```bash
   git lfs install
   ```

2. Track large files:
   ```bash
   git lfs track "static/videos/*.mp4"
   git lfs track "static/images/jellyfish.png"
   ```

3. Commit and push:
   ```bash
   git add .gitattributes
   git add static/videos/
   git commit -m "Add videos with Git LFS"
   git push
   ```

4. Note: GitHub free tier includes 1 GB LFS storage

### Option 3: Cloud Storage Links

**Use Google Drive, Dropbox, or AWS S3:**

1. Upload large files to cloud storage
2. Generate public/shareable links
3. Update application to fetch from URLs
4. Create `LARGE_FILES_DOWNLOAD.md` with links

### Option 4: Compress Images

**Reduce image sizes without quality loss:**

```bash
# Install ImageMagick or use online tools
# Compress PNG files
mogrify -strip -quality 85 static/images/*.png

# Convert to WebP (better compression)
cwebp -q 80 input.png -o output.webp
```

## Current Repository Size

**With .gitignore exclusions:**
- Estimated size: ~150-200 MB (manageable for GitHub)
- Without videos: ~250 MB
- With docs/ excluded: Saves another ~250 MB

**GitHub Limits:**
- Repository size warning: 1 GB
- File size limit: 100 MB per file
- Recommended: Keep under 500 MB total

## Setup Instructions for New Developers

### After Cloning Repository

1. **Download large files** (if using external hosting):
   - See `LARGE_FILES_DOWNLOAD.md` for links
   - Place in `static/videos/` and `static/images/`

2. **Or use YouTube embeds** (no download needed):
   - Videos load from YouTube
   - No local files required

3. **Rebuild static site**:
   ```bash
   python build_static.py
   ```

## Deployment Strategies

### Heroku
- Use external video hosting (YouTube)
- Images under 2 MB can stay in repo
- Total slug size limit: 500 MB

### GitHub Pages
- Build static site with `build_static.py`
- Use YouTube embeds for videos
- Compress images to WebP
- Deploy `docs/` folder

### Vercel/Netlify
- Similar to GitHub Pages
- Better CDN for images
- Can handle larger assets

## Recommended Approach for This Project

1. **Videos**: Upload to YouTube, use embeds
2. **Large images**: Compress to WebP format
3. **Medallion images**: Keep as-is (small enough)
4. **docs/ folder**: Exclude from Git, regenerate on deployment
5. **Repository size**: Target under 200 MB

## Files to Keep in Repository

Essential files that should stay:
- All HTML templates
- CSS and JavaScript
- Small images (under 1 MB)
- Medallion designs (mostly under 500 KB)
- Documentation
- Python backend code

## Compression Commands

```bash
# Compress all large PNGs to WebP
for file in static/images/*.png; do
    cwebp -q 85 "$file" -o "${file%.png}.webp"
done

# Compress videos (if keeping local)
ffmpeg -i input.mp4 -vcodec h264 -crf 28 output-compressed.mp4
```

## Status

- `.gitignore` updated to exclude large files
- Videos already excluded
- docs/ folder excluded
- Ready for GitHub push

## Next Steps

1. Decide on video hosting strategy
2. Optionally compress large images
3. Test deployment without large files
4. Update documentation with video embed URLs
5. Push to GitHub

---

**Last Updated:** May 1, 2026
