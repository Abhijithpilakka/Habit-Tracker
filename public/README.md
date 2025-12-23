This folder contains static assets served by Vite.

Placeholder icons were added automatically to avoid 404s for the PWA manifest and social preview metadata. These are tiny placeholder images (1x1 PNGs) and should be replaced with real assets.

Recommended steps to create proper favicons and icons (on macOS with ImageMagick installed):

```bash
# from your svg (e.g., vite.svg) create PNGs and an ico
convert -background none public/vite.svg -resize 16x16 public/favicon-16x16.png
convert -background none public/vite.svg -resize 32x32 public/favicon-32x32.png
convert -background none public/vite.svg -resize 192x192 public/android-chrome-192x192.png
convert -background none public/vite.svg -resize 512x512 public/android-chrome-512x512.png
convert public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/favicon.ico
```

Also create a social preview image `/public/og-image.png` (1200x630 recommended).
