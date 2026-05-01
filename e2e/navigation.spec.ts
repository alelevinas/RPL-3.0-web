import { test, expect } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, "student1", "password123");
  });

  test("courses page lists at least one course", async ({ page }) => {
    await expect(page).toHaveURL(/\/courses$/);
    // Wait for cards to render (at least one "Abrir" or "Inscribirse" button)
    await expect(page.getByRole("button", { name: /abrir|inscribirse/i }).first()).toBeVisible();
  });

  test("opening a course navigates to its dashboard", async ({ page }) => {
    await page.getByRole("button", { name: /abrir/i }).first().click();
    await expect(page).toHaveURL(/\/courses\/\d+\/dashboard/);
  });

  test("sidebar Actividades link goes to the activities page", async ({ page }) => {
    await page.getByRole("button", { name: /abrir/i }).first().click();
    await expect(page).toHaveURL(/\/courses\/\d+\/dashboard/);

    await page.getByRole("link", { name: /actividades/i }).click();
    await expect(page).toHaveURL(/\/courses\/\d+\/activities/);
    await expect(page.getByText(/actividades/i).first()).toBeVisible();
  });

  test("clicking an activity card opens the solver", async ({ page }) => {
    await page.getByRole("button", { name: /abrir/i }).first().click();
    await page.getByRole("link", { name: /actividades/i }).click();
    await expect(page).toHaveURL(/\/courses\/\d+\/activities/);

    // Click the first activity card (any clickable card area)
    await page.locator("[data-activityid], .activity-card, article").first().click().catch(async () => {
      // Fallback: click the first link inside the activities grid
      await page.locator("main a, main [role='button']").first().click();
    });

    await expect(page).toHaveURL(/\/courses\/\d+\/activities\/\d+/);
  });
});
