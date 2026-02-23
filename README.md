# Sahan Pramuditha Portfolio

Interactive personal portfolio built with React, Vite, Tailwind CSS, Framer Motion, and Three.js.

## Live

- Production: https://www.sahanpramuditha.me

## Features

- Smooth single-page sections with scroll progress and scroll-to-top.
- Interactive 3D experiences (Three.js and React Three Fiber).
- ISS preview with Sketchfab primary embed and local GLB fallback.
- Theme accent color picker with persistent selection.
- Keyboard shortcuts (`?`, `G H`, `G A`, `G P`, `G C`) and skip-to-content support.
- SEO metadata, Open Graph tags, and JSON-LD structured data.
- Contact form with endpoint support, Formspree support, and mailto fallback.
- Optional analytics hooks for custom endpoint, GA4, and Plausible.
- Konami-code easter egg that opens a mini snake game.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 3
- Framer Motion
- GSAP
- Three.js + @react-three/fiber + @react-three/drei
- Lucide React

## Requirements

- Node.js `^20.19.0 || >=22.12.0` (required by Vite 7)
- npm 10+

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Scripts

```bash
npm run dev      # start local dev server
npm run build    # production build to dist/
npm run preview  # preview production build locally
npm run lint     # run eslint
```

## Environment Variables

Create a `.env` file from `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_RESUME_URL` | No | External resume URL. If empty, app uses `/resume.pdf`. |
| `VITE_CONTACT_ENDPOINT` | No | Full POST endpoint for contact form submissions. |
| `VITE_FORMSPREE_ID` | No | Formspree form ID (used if `VITE_CONTACT_ENDPOINT` is not set). |
| `VITE_GITHUB_TOKEN` | No | GitHub token to reduce API rate-limit issues for GitHub stats. |
| `VITE_ANALYTICS_ENDPOINT` | No | Custom analytics ingestion endpoint. |

## Project Structure

```text
.
|-- public/
|   |-- models/iss/               # local GLB fallback model
|   |-- robots.txt
|   |-- sitemap.xml
|   `-- site.webmanifest
|-- src/
|   |-- components/               # UI sections, effects, and 3D components
|   |-- config/                   # earth and model config
|   |-- context/                  # theme context
|   `-- utils/analytics.js
|-- EARTH_TUNING_GUIDE.md         # earth visual tuning guide
|-- LAUNCH_CHECKLIST.md           # release checklist for GitHub/public launch
`-- README.md
```

## Customization Guide

- Profile and hero text: `src/components/Hero.jsx`
- About and experience content: `src/components/About.jsx`, `src/components/Experience.jsx`
- Skills and 3D model behavior: `src/components/Skills.jsx`, `src/config/modelConfig.js`
- Projects list: `src/components/Projects.jsx`
- Certifications: `src/components/Certifications.jsx`
- Contact behavior: `src/components/Contact.jsx`
- SEO/meta tags: `src/components/SEO.jsx`, `src/components/StructuredData.jsx`
- Earth scene tuning: `src/config/earthConfig.js` and `EARTH_TUNING_GUIDE.md`

## Deployment

This app outputs static files to `dist/` and works on:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages (with Vite base-path setup if hosted in a subpath)

Standard deploy command:

```bash
npm run build
```

## Launch Checklist

Before making the repository public, complete `LAUNCH_CHECKLIST.md`.

## GitHub Community Docs

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `.github/ISSUE_TEMPLATE/`
- `.github/pull_request_template.md`

## License

This project is licensed under the MIT License. See `LICENSE`.
