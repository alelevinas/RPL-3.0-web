import { APIRequestContext, Page } from "@playwright/test";

export const USERS_API = "http://localhost:8000/api/v3";
export const ACTIVITIES_API = "http://localhost:8001/api/v3";
export const RUNNER_API_KEY = process.env.E2E_RUNNER_API_KEY ?? "local_runner_api_key";
const TOKEN_KEY = "rpl_token";

export type Token = { tokenType: string; accessToken: string };

export async function apiLogin(
  request: APIRequestContext,
  username: string,
  password: string,
): Promise<Token> {
  const res = await request.post(`${USERS_API}/auth/login`, {
    data: { username_or_email: username, password },
  });
  const data = await res.json();
  return { tokenType: data.token_type, accessToken: data.access_token };
}

/** Injects the token into the page's localStorage before the first navigation. */
export async function injectToken(page: Page, token: Token) {
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [TOKEN_KEY, JSON.stringify(token)],
  );
}

/** Full UI login — fills the form and waits for redirect. */
export async function loginViaUI(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.locator('input[type="text"]').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /ingresar/i }).click();
  await page.waitForURL("**/courses");
}
