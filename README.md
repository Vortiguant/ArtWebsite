# Art and Sunny Things

Static portfolio site for Sunita Kamal showcasing sun-soaked paintings, gallery detail pages, and contact touchpoints. Built with plain HTML, CSS, and vanilla JS for fast, zero-dependency delivery.

## Features
- Responsive multi-page layout (`index.html`, `gallery.html`, `about.html`, `contact.html`) plus individual artwork detail pages under `art/`.
- Gallery and Instagram sections driven by JSON data (`data/artworks.json`, `data/instagram.json`) for simple content updates.
- Form validation with spam honeypot, user feedback states, and a local fallback until real endpoints are connected (`js/forms.js`).
- Lightweight enhancements: custom cursor, toasts, per-artwork detail scripting, and analytics stub.

## Project structure
```
.
├── assets/           # Images and static assets
├── css/              # Stylesheets
├── data/             # Content feeds (artwork + Instagram)
├── js/               # Client-side scripts
├── art/              # Individual artwork detail pages
├── index.html        # Home
├── gallery.html      # Gallery listing
├── about.html        # Artist story
└── contact.html      # Contact + newsletter
```

## Run locally
```bash
git clone https://github.com/Vortiguant/ArtWebsite.git
cd ArtWebsite
# Option 1: open index.html directly in a browser
# Option 2: serve for clean relative paths
python3 -m http.server 4000
# then visit http://localhost:4000
```

## Content updates
- Artwork data: edit `data/artworks.json` (title, medium, dimensions, year, category, image paths, commentary, slug).
- Instagram data: edit `data/instagram.json` to refresh the feed tiles.
- Artwork pages: add HTML files under `art/` matching the `slug` used in `artworks.json`.
- Images: place new assets in `assets/images/` and reference them in the JSON or page markup.

## Forms and endpoints
Form handling lives in `js/forms.js`. Replace the placeholder endpoints (`/api/contact-secure`, `/api/newsletter`) with your real API routes or email service. Until then, submissions will show a local confirmation for testing.

## Deploy
GitHub Pages keeps deployments in sync with each push:
1. In GitHub: Settings → Pages → Build and deployment → Source: “Deploy from a branch.”
2. Branch: `main`, Folder: `/ (root)`. Save.
3. Pages will publish to a URL like `https://vortiguant.github.io/ArtWebsite/`; every push to `main` redeploys automatically.

Alternatives: Netlify or Vercel—connect the repo, leave build command empty (static site), and set publish directory to the repo root for automatic deploys on push.
