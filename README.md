# RPL-3.0-web (Frontend)

The RPL-3.0-web is a modern web application built with Next.js 15, React 19, and MUI v7.

## Setup

### Prerequisites

- Node.js 22
- NPM

### Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```

3.  **Build for production:**
    ```bash
    npm run build
    ```

## Configuration

Environment variables can be set in `.env.local`:

- `NEXT_PUBLIC_USERS_API_BASE_URL`: URL of the Users API (default: http://localhost:8000/api/v3).
- `NEXT_PUBLIC_ACTIVITIES_API_BASE_URL`: URL of the Activities API (default: http://localhost:8001/api/v3).

## Testing

Run unit tests with Vitest:

```bash
npm test
```

Run E2E tests with Playwright:

```bash
npm run test:e2e
```

## Theme

The application uses a customized MUI theme with FIUBA's official colors. It supports a dark mode toggle that persists in local storage.
