# Play Store Assets

Generated graphics for the Google Play Store listing. All sizes meet Play
Console requirements.

| File | Size | Where it goes in Play Console |
|------|------|-------------------------------|
| `feature-graphic.png` | 1024×500 | Main store listing → Graphics → Feature graphic |
| `screenshot-1-analyze.png` | 1080×1920 | Main store listing → Phone screenshots |
| `screenshot-2-opener.png` | 1080×1920 | Main store listing → Phone screenshots |
| `screenshot-3-value.png` | 1080×1920 | Main store listing → Phone screenshots |

The **app icon** (512×512) already exists at `public/icon-512.png`.

## Regenerating

These are designed promo graphics (not raw device captures), rendered in pure
JS so they build anywhere — no browser or Photoshop needed:

```bash
cd play-store/assets
npm install pureimage    # one-time
node generate.js .       # rewrites the PNGs in this folder
```

Edit `generate.js` to change copy, colors, or the example replies. Brand
colors: `#E8395A` (pink), `#FFF8F2` (cream).

## Want real device screenshots instead?

Designed graphics are fine for launch, but real captures from the live PWA
can convert better. On your phone, open the app, take screenshots, and drop
them in here (any size from 1080×1920 up to 3840px works). You can mix real
captures and these designed ones.
