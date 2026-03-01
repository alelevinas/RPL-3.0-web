# RPL-3.0-web (Frontend) Improvements

Proposed improvements for the RPL-3.0-web Next.js application.
**Scoring:** 1 (Low) to 5 (High). C: Complexity, R: Risk.

## 1. UI/UX Refinement
*   **Refresh MUI Theme:** Modernize the MUI theme. Use FIUBA's colors and custom typography for a consistent brand. Implement a dark mode toggle to improve the student experience for late-night coding.
    *   **C: 2 | R: 1**
*   **A11y Audit:** Use `axe-core` to find accessibility issues. Ensure all inputs have labels and that navigation is keyboard-friendly for students with motor/visual impairments.
    *   **C: 2 | R: 1**
*   **Responsive Design:** Use MUI's responsive breakpoints and Grid/Box systems to ensure the dashboard and activity pages work on mobile and tablet screens.
    *   **C: 3 | R: 1**
*   **Mistake Highlight UI:** Implement a component that takes structured error data (line numbers, mistake types) and highlights the corresponding code blocks with student-friendly hints.
    *   **C: 3 | R: 2**

## 2. Features & Interactivity
*   **Monaco/CodeMirror Editor:** Replace the current text area with `@monaco-editor/react`. Add syntax highlighting for C, Python, and Rust. Enable basic autocompletion and linting for common mistakes.
    *   **C: 4 | R: 2**
*   **SSE for Submission Status:** Switch from polling to Server-Sent Events (SSE). This provides a real-time, "live" feeling when students submit code and wait for results.
    *   **C: 3 | R: 3**
*   **Mistake Dashboard:** Create a "Student Performance" page. It should show the student's most common errors (e.g., "Memory Leak", "Infinite Loop") and provide helpful links to course materials.
    *   **C: 3 | R: 1**

## 3. Documentation
*   **Storybook Integration:** Set up Storybook. Create stories for all UI components (e.g., buttons, activity cards). This ensures UI consistency and serves as documentation for frontend devs.
    *   **C: 2 | R: 1**
*   **README Revamp:** Update instructions for Node 22 and Next.js 15. Explicitly document the `.env.local` keys and local development setup using the root task runner.
    *   **C: 1 | R: 1**

## 4. Testing
*   **Playwright E2E:** Implement core flow tests (Login -> Course -> Activity -> Submission -> Result). Run them against a real dev environment in the CI to prevent critical path regressions.
    *   **C: 4 | R: 2**
*   **Vitest Unit Coverage:** Increase coverage for complex React hooks and data-fetching logic. Aim for 70%+ coverage of the `src/services` and `src/utils` folders.
    *   **C: 3 | R: 1**
*   **Visual Regression:** Use `chromatic` or a local tool like `playwright-visual-regression` to capture screenshots and catch unintentional UI changes in PRs.
    *   **C: 3 | R: 2**

## 5. DX & CD
*   **Next.js 15 Best Practices:** Migrate all data-fetching to Server Components where possible. Use React 19's `useOptimistic` for submission UI to provide immediate feedback to the student.
    *   **C: 4 | R: 3**
*   **CI Linting & Format:** Enforce `eslint` and `prettier` in a pre-commit hook (using `husky` and `lint-staged`) to maintain code quality and style consistency.
    *   **C: 2 | R: 1**
