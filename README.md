# Peak Aquatic Sports

Website for Peak Aquatic Sports — competitive swimming consultancy based in Ramsey, NJ.

## Develop

```
npm install
npm run dev      # Vite dev server on http://localhost:8421
```

## Deploy

The site is a Vite + React app and must be built before it is served; publishing the
source `index.html` directly renders a blank page.

- **Vercel**: builds with `npm run build:vercel` (`vercel.json` sets the Vite framework).
- **GitHub Pages**: `npm run deploy` builds `dist/` and pushes it to the `gh-pages` branch.
  The site is served from the root of `peakaquaticsports.com` (`public/CNAME`), so it builds with base `/`.

## Structure

```
index.html   ← Vite entry point
src/         ← React app
public/      ← static assets copied as-is (CNAME, images)
api/         ← serverless functions
scripts/     ← calendar compiler tooling (see scripts/.env.example)
```
