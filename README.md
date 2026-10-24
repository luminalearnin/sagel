# SAGEL™

A human-touch fashion editorial storefront for SAGEL’s ethnic fusion collections.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The interface includes live collection filters, product search, product detail sizing, quick view, saved pieces, a compact four-button bottom dock, bag state, checkout handoff, and locally bundled official catalog photography.

## Production deployment

The canonical production source is **`main` → `/docs`**. GitHub Pages is configured to publish only from that source using GitHub’s managed Pages build. Every production change must be committed and pushed to `main`; the build output must be regenerated into `docs` first.

```bash
npm run build
rm -rf docs && cp -R dist docs && touch docs/.nojekyll
git add . && git commit -m "Describe the release"
git push origin main
```

Do not publish or push a separate `gh-pages` branch. It is not the production source for this repository.
