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

## Nuevas funcionalidades añadidas
- Se agregó una interfaz de chat en `src/components/ImageGenerator.tsx` para interactuar con el endpoint `/api/chat/`.
- El chat devuelve respuestas basadas en los PDFs y actualiza el puntaje del usuario según las reglas de juego.
