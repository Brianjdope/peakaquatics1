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
- **GitHub Pages**: every push to `main` runs the tests, builds `dist/` and publishes it to the
  `gh-pages` branch ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)); pull requests
  get the same tests and build as a check. `npm run deploy` still publishes by hand from your machine.
  The site is served from the root of `peakaquaticsports.com` (`public/CNAME`), so it builds with base `/`.

## Structure

```
index.html   ← Vite entry point
src/         ← React app
public/      ← static assets copied as-is (CNAME, images)
scripts/     ← calendar compiler tooling (see scripts/.env.example)
```
