# Source photography

Camera originals for the storefront. **Nothing here is served to visitors** — it is
outside `public/`, so Next.js never routes to it.

`public/` holds the web-ready `.webp` derivatives generated from these files. To
regenerate them after adding or replacing an original:

```bash
node scripts/optimize-images.mjs          # convert + rewrite the LQIP manifest
node scripts/optimize-images.mjs --check  # report only, change nothing
```

The script resizes to a 2400px longest edge at WebP quality 82, honours EXIF
rotation, and writes `src/lib/image-blur.ts` with a base64 blur placeholder for
every raster asset in `public/`.

These originals are kept in the repository so the derivatives can always be
rebuilt at a different size or quality. If you would rather keep them in your own
photo storage, move this directory out and delete it — nothing in the build reads
from it.
