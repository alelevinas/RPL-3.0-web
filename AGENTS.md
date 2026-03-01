# RPL-3.0-web Frontend

## What This Is

Next.js frontend for the RPL platform. Students browse courses, solve coding activities in a Monaco editor, and submit solutions. Teachers manage courses, create activities, and review submissions.

## Stack

- **Node.js 22**, **Next.js 15** (App Router), **React 19**, **TypeScript 5.9**
- **MUI v7** (`@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/x-date-pickers`)
- **Monaco Editor** via `@monaco-editor/react` (dynamic import to avoid SSR)
- **ESLint 9** with `eslint-config-next`

## Project Structure

```
RPL-3.0-web/
├── package.json
├── next.config.mjs                # Next.js config (images, experimental opts)
├── server.js                      # Custom server — binds port before Next.js compiles
├── tsconfig.json
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── layout.tsx             # Root layout (ThemeProvider, StateProvider)
│   │   ├── page.tsx               # Landing → redirects to /courses or /login
│   │   ├── (public)/              # Login, signup, forgot-password (no auth)
│   │   ├── (private)/             # Auth-guarded routes
│   │   │   ├── layout.tsx         # Auth check, TopBar, SideBar
│   │   │   ├── courses/           # Course list, create
│   │   │   │   └── [courseId]/    # Dashboard, activities, students, edit
│   │   │   │       └── activities/[activityId]/  # Solve, edit, correction, definitives
│   │   │   ├── profile/
│   │   │   └── users/
│   │   └── user/                  # Email validation, password reset
│   ├── components/                # Shared components (TopBar, SideBar, MonacoEditor, etc.)
│   ├── services/                  # API client functions (one file per domain)
│   ├── lib/
│   │   ├── state.tsx              # React Context state management (useAppState hook)
│   │   └── request.ts             # Fetch wrapper with JWT auth injection
│   ├── theme/                     # MUI v7 theme + dark mode toggle
│   ├── types/                     # TypeScript type definitions
│   └── utils/                     # Constants, validators, messages
├── public/                        # Static assets
└── .env.local                     # API URLs (NEXT_PUBLIC_* vars)
```

## Code Patterns

- **React 19 functional components** with hooks. No class components.
- **MUI v7** — use `@mui/material` imports. Grid uses `size` prop (not `item`/`xs`/`sm`/`md`).
- **Routing**: Next.js App Router with route groups `(public)` and `(private)`.
- **State**: React Context via `useAppState()` hook from `@/lib/state`.
- **API calls**: Service functions in `src/services/` using `@/lib/request` (fetch + JWT).
- **Environment variables**: `NEXT_PUBLIC_USERS_API_BASE_URL` and `NEXT_PUBLIC_ACTIVITIES_API_BASE_URL` in `.env.local`.
- **Monaco Editor**: Loaded via dynamic import (`next/dynamic` with `ssr: false`).

## Running

```bash
npm install
npm run dev        # Dev server on port 8088 (custom server.js)
npm run build      # Production build
npm run lint       # ESLint
npm test           # Vitest (single run)
npm run test:watch # Vitest (watch mode)
```

## Testing

**Stack**: Vitest + React Testing Library + jsdom. Config in `vitest.config.ts`, setup in `src/__tests__/setup.ts`.

Tests live in `src/__tests__/` and follow the pattern `ComponentName.test.tsx`.

```bash
npm test                                          # Run all tests
npx vitest run src/__tests__/CustomSnackbar.test.tsx  # Run one file
```

### Test-first rule for bug fixes

When a component or page fails at runtime, **always write a failing test first** before fixing the code:

1. Write a test in `src/__tests__/` that reproduces the exact failure (e.g., passing the problematic input).
2. Run it to confirm it fails with the same error.
3. Fix the component.
4. Run the test again to confirm it passes.

This applies to rendering errors, prop type mismatches, unhandled API response shapes, and any runtime crash in a component or page.

### What to test

- Components that transform or display external data (API responses, error objects).
- Components with conditional rendering logic.
- Utility functions in `src/utils/` and `src/lib/`.

## Backend API Integration

The frontend calls two backend APIs:
- **Users API** (`NEXT_PUBLIC_USERS_API_BASE_URL`): Auth, user profiles, courses, enrollment
- **Activities API** (`NEXT_PUBLIC_ACTIVITIES_API_BASE_URL`): Activities, submissions, test results, files

Configured in `.env.local`:
```
NEXT_PUBLIC_USERS_API_BASE_URL=http://localhost:8000/api/v3
NEXT_PUBLIC_ACTIVITIES_API_BASE_URL=http://localhost:8001/api/v3
```

## Dependencies on Other Repos

- Consumes REST APIs from `RPL-3.0` (both users and activities services).
- API contract changes in the backend require updates to service functions in `src/services/`.

## Dev Server Notes

- `server.js` is a custom Node HTTP server that binds port 8088 immediately, then calls `app.prepare()`. This ensures readiness checks pass while Next.js compiles pages on demand.
- Production build (`next build`) may fail with SIGBUS in memory-constrained environments (<4GB). Use `experimental.workerThreads: false` and `cpus: 1` in `next.config.mjs` to reduce memory usage.

## Agent Tasks

- **Expand test coverage**: Add tests for components in `src/components/` and pages that handle API data.
- **Accessibility**: Add ARIA labels, keyboard navigation, screen reader support.
- **Error handling**: Add error boundaries and user-facing error messages for API failures.
