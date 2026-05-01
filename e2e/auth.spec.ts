import { test, expect } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";

test.describe("Authentication", () => {
  test("valid credentials navigate to courses page", async ({ page }) => {
    await loginViaUI(page, "student1", "password123");
    await expect(page).toHaveURL(/\/courses$/);
    await expect(page.getByText(/cursos/i).first()).toBeVisible();
  });

  test("invalid credentials show an error message", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="text"]').fill("student1");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: /ingresar/i }).click();

    await expect(page.getByText(/usuario o contraseña incorrectos/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout redirects to login page", async ({ page }) => {
    await loginViaUI(page, "student1", "password123");

    // Open avatar dropdown and click logout
    await page.locator('[aria-label="account menu"], button:has(> [class*="Avatar"])').last().click();
    await page.getByText(/cerrar sesión/i).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
