# Geometry Challenge Frontend

This is the React/Vite frontend for the Geometry Challenge app.

## Requirements
- Node.js
- npm or yarn

## Install dependencies
From the `frontend-web` folder, run:

```bash
npm install
```

or, if you use yarn:

```bash
yarn install
```

## Run locally
Start the Vite development server:

```bash
npm run dev
```

Then open the app at:

- http://127.0.0.1:5173

## Build for production
```bash
npm run build
```

## Preview production build
## powershell -ExecutionPolicy Bypass -Command "npm run dev"
```bash
npm run preview

```

## Backend proxy
The frontend is configured to proxy `/api` requests to the backend at:

- http://127.0.0.1:8000

So the backend should be running before you use frontend features that call the API.

## OpenAPI types and data fetching
Generate TypeScript types from the Django OpenAPI schema with:

```bash
npm run generate:types
```

The script defaults to `http://localhost:8000/api/schema/`. Change that URL in
the `generate:types` script in `package.json` if your Django schema is hosted elsewhere.
The generated types are written to `src/types/api.d.ts`.

The app is wrapped with TanStack Query's provider in `src/main.tsx`. Use
`src/hooks/useExampleData.ts` as a typed GET-query template; replace the sample
`/api/example/` endpoint and example types with an endpoint from your schema after
generating types. TanStack Query exposes `isLoading`, `isError`, `error`, and `data`
from the hook, and caches the result under its query key.

## Nuevas funcionalidades añadidas
- Se agregó una interfaz de chat en `src/components/ImageGenerator.tsx` para interactuar con el endpoint `/api/chat/`.
- El chat devuelve respuestas basadas en los PDFs y actualiza el puntaje del usuario según las reglas de juego.
