/**
 * Solver E2E tests — cover the full submission flow:
 *   1. Open an activity in the code editor
 *   2. Click "Entregar"
 *   3. Simulate the runner completing the job (no real runner needed)
 *   4. Assert the SSE stream delivers the result and the UI updates
 *
 * Services required: frontend (8088), users API (8000), activities API (8001), MySQL.
 * Runner and RabbitMQ are NOT needed — the test calls the runner-facing Activities
 * API endpoints directly with the runner key to simulate execution.
 */

import { test, expect } from "@playwright/test";
import {
  apiLogin,
  injectToken,
  USERS_API,
  ACTIVITIES_API,
  RUNNER_API_KEY,
  type Token,
} from "./helpers/auth";

// ─── Shared setup ─────────────────────────────────────────────────────────────

let token: Token;
let courseId: number;
let activityId: number;

/** Discover the first available course and activity once before the suite. */
test.beforeAll(async ({ request }) => {
  token = await apiLogin(request, "student1", "password123");

  const coursesRes = await request.get(`${USERS_API}/users/me/courses`, {
    headers: { Authorization: `${token.tokenType} ${token.accessToken}` },
  });
  expect(coursesRes.ok()).toBeTruthy();
  const courses = await coursesRes.json();
  expect(courses.length).toBeGreaterThan(0);
  courseId = courses[0].id;

  const activitiesRes = await request.get(
    `${ACTIVITIES_API}/courses/${courseId}/activities`,
    { headers: { Authorization: `${token.tokenType} ${token.accessToken}` } },
  );
  expect(activitiesRes.ok()).toBeTruthy();
  const activitiesData = await activitiesRes.json();
  // Activities endpoint may return { activities: [...] } or a flat array
  const activities = Array.isArray(activitiesData)
    ? activitiesData
    : activitiesData.activities ?? [];
  expect(activities.length).toBeGreaterThan(0);
  activityId = activities[0].id;
});

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Solver page", () => {
  test("renders the code editor and Entregar button", async ({ page }) => {
    await injectToken(page, token);
    await page.goto(`/courses/${courseId}/activities/${activityId}`);

    await expect(page.getByRole("button", { name: /entregar/i })).toBeVisible();
    // Code editor area should be present
    await expect(page.locator("textarea, .monaco-editor").first()).toBeVisible();
  });

  test("submitting code triggers SSE and shows result in Resultados tab", async ({
    page,
    request,
  }) => {
    await injectToken(page, token);
    await page.goto(`/courses/${courseId}/activities/${activityId}`);
    await expect(page.getByRole("button", { name: /entregar/i })).toBeVisible();

    // Capture the submission ID from the POST response
    const [submissionResponse] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/submissions") &&
          r.request().method() === "POST" &&
          !r.url().includes("/execLog") &&
          !r.url().includes("/status"),
      ),
      page.getByRole("button", { name: /entregar/i }).click(),
    ]);

    expect(submissionResponse.ok()).toBeTruthy();
    const { id: submissionId } = await submissionResponse.json();
    expect(typeof submissionId).toBe("number");

    // Status chip should show processing state immediately
    await expect(
      page.getByText(/en cola|ejecutando|en proceso/i).first(),
    ).toBeVisible();

    // ── Simulate the runner ──────────────────────────────────────────────────
    const runnerHeaders = {
      Authorization: `Bearer ${RUNNER_API_KEY}`,
      "Content-Type": "application/json",
    };

    // 1. Mark as PROCESSING
    const processingRes = await request.put(
      `${ACTIVITIES_API}/submissions/${submissionId}/status`,
      {
        data: { status: "PROCESSING" },
        headers: runnerHeaders,
      },
    );
    expect(processingRes.ok()).toBeTruthy();

    // 2. Post execution results (triggers SUCCESS status and SSE result event)
    const execLogRes = await request.post(
      `${ACTIVITIES_API}/submissions/${submissionId}/execLog`,
      {
        data: {
          tests_execution_result_status: "OK",
          tests_execution_stage: "test",
          tests_execution_exit_message: "",
          tests_execution_stderr: "",
          tests_execution_stdout: "",
          all_student_only_outputs_from_iotests_runs: [],
        },
        headers: runnerHeaders,
      },
    );
    expect(execLogRes.ok()).toBeTruthy();

    // ── Assert the UI updated ────────────────────────────────────────────────
    // The SSE stream should deliver the result and auto-switch to Resultados tab
    await expect(page.getByText(/resuelto|success/i).first()).toBeVisible({
      timeout: 15_000,
    });

    // Resultados tab should now be active (contains test results)
    await expect(page.getByText(/resultados/i).first()).toBeVisible();
  });

  test("submitting while already processing is disabled", async ({ page }) => {
    await injectToken(page, token);
    await page.goto(`/courses/${courseId}/activities/${activityId}`);
    await expect(page.getByRole("button", { name: /entregar/i })).toBeVisible();

    // Click submit without simulating the runner — button should go disabled
    await page.getByRole("button", { name: /entregar/i }).click();

    // While the SSE stream is open (no runner → keeps ENQUEUED), button is disabled
    await expect(page.getByRole("button", { name: /entregar/i })).toBeDisabled({
      timeout: 5_000,
    });
  });
});
