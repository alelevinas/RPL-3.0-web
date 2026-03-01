# Frontend Testing Plan (RPL-3.0-web)

Testing strategy for the RPL-3.0 Next.js 15 / React 19 application.

## 1. Unit & Component Tests (Current)
- **Tool**: `vitest` + `react-testing-library`.
- **Scope**: Components, Hooks, API services.
- **Status**: ~30% coverage.

## 2. Gaps & Improvements (Target)

### 2.1. End-to-End (E2E) Testing
Full user journeys are not yet automated.
- **Plan**: Implement **Playwright** tests for:
  - User Login -> Course Selection -> Activity Submission.
  - Course Creation -> Activity Creation (Admin).
- **Target**: `src/e2e/*.spec.ts`.

### 2.2. Visual Regression Testing
Ensure that theme updates (MUI v7) don't break existing layouts.
- **Plan**: Use Playwright's visual comparison feature to capture screenshots of key pages.

### 2.3. API Caching Verification
Ensure that React Server Components are properly caching (or not caching) data as intended.
- **Plan**: Mock the API and count the number of requests for key operations.

## 3. GitHub Actions Workflow (`.github/workflows/vitest.yml`)

The workflow must include:
1. **Node.js Setup**: Node.js 22.
2. **Execution**: `npm run test` (Vitest).
3. **E2E execution**: `npx playwright test`.

## 4. Test Categories

- **Unit**: Testing utility functions and React hooks.
- **Component**: Testing UI interactions and rendering.
- **E2E**: Real-world flows with a mock backend.
- **Accessibility**: Use `axe-core` within Vitest or Playwright to catch ARIA issues.
