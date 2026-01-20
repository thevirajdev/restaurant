# AURELIA Restaurant

Elegant fine dining restaurant web app built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

## Features

- Elegant landing and marketing pages
- Menu browsing with rich visuals
- Reservation flow scaffolding
- Responsive UI with modern typography

## Tech Stack

- Vite
- React 18 + TypeScript
- Tailwind CSS + tailwind-merge + tailwindcss-animate
- shadcn/ui (Radix UI primitives)
- React Router

## Getting Started

Prerequisites:

- Node.js LTS and npm

Install and run:

```bash
git clone <REPO_URL>
cd <PROJECT_DIR>
npm install
npm run dev
```

The app starts at http://localhost:8080

## Scripts

- dev: Start the Vite dev server
- build: Production build
- build:dev: Development-mode build
- preview: Preview the production build
- lint: Run ESLint

## Project Structure

- src: Application source code
- index.html: App HTML template and meta tags
- vite.config.ts: Vite configuration and path aliases
- tailwind.config.* and postcss.config.*: Styling configuration

## Environment

No required environment variables by default. If you add APIs or services, document them here.

## Deployment

Any static hosting that supports Vite builds will work (e.g., Netlify, Vercel, GitHub Pages):

```bash
npm run build
```

Upload the generated dist/ directory to your hosting provider.

## License

Proprietary. All rights reserved. Replace with your preferred license if needed.
