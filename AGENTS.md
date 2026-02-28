# RPL-3.0-web Frontend

## What This Is

React SPA for the RPL platform. Students browse courses, solve coding activities in a Monaco editor, and submit solutions. Teachers manage courses, create activities, and review submissions.

## Project Structure

```
RPL-3.0-web/
├── package.json
├── webpack.config.js              # Webpack 4 config with dotenv, Monaco plugin
├── .babelrc                       # Babel config (env, react, flow presets)
├── .eslintrc.json                 # ESLint with Airbnb config
├── .nvmrc                         # Node 10.16.3 (legacy)
├── src/
│   ├── index.js                   # App entry point
│   ├── index.html                 # HTML template
│   ├── components/                # React components (class-based)
│   ├── services/                  # API client functions
│   ├── utils/                     # Shared utilities
│   └── theme/                     # Material-UI theme
└── nginx.conf                     # Production nginx config
```

## Code Patterns

- **React 16 class components** — not functional components with hooks. Follow this pattern for consistency.
- **Material-UI v4** — use `@material-ui/core` imports, not `@mui/material`.
- **Routing**: `react-router-dom` v5 with `PrivateRoute` and `PublicRoute` wrappers.
- **Code editor**: Monaco Editor via `react-monaco-editor`.
- **API calls**: Service functions in `src/services/` that call the backend APIs.
- **Environment variables**: Injected at build time via `dotenv-webpack`. Configured in `.env.development` (local) and `.env.production`.

## Running

```bash
npm install
npm start          # Dev server on port 8088
npm run build      # Production build to dist/
npm run lint       # ESLint
```

## Backend API Integration

The frontend calls two backend APIs:
- **Users API** (`USERS_API_BASE_URL`): Auth, user profiles, courses, enrollment
- **Activities API** (`ACTIVITIES_API_BASE_URL`): Activities, submissions, test results, files

API base URLs are configured in `.env.development`:
```
USERS_API_BASE_URL=http://localhost:8000
ACTIVITIES_API_BASE_URL=http://localhost:8001
```

## Dependencies on Other Repos

- Consumes REST APIs from `RPL-3.0` (both users and activities services).
- API contract changes in the backend require updates to service functions in `src/services/`.

## Agent Tasks

Useful work an agent can do:
- **Add tests**: No test suite exists. Set up Jest + React Testing Library.
- **Dependency updates**: React 16 → 18, Material-UI v4 → v5, Webpack 4 → 5, Node 10 → 18+. These are large migrations — do them incrementally.
- **Accessibility**: Add ARIA labels, keyboard navigation, screen reader support.
- **Error handling**: Add error boundaries and user-facing error messages for API failures.
- **TypeScript migration**: The project uses Flow types minimally. Consider migrating to TypeScript.

## ⚠️ Known Issues

- Node version in `.nvmrc` is 10.16.3 (EOL). The project works with Node 18 for development.
- No test suite (`npm test` just echoes an error).
- Some dependencies are outdated and have known vulnerabilities.
