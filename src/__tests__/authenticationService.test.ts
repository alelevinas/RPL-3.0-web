import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "@/services/authenticationService";
import * as requestModule from "@/lib/request";

vi.mock("@/lib/request", () => ({
  request: vi.fn(),
}));

const mockRequest = vi.mocked(requestModule.request);

beforeEach(() => {
  mockRequest.mockReset();
});

describe("login", () => {
  it("sends username_or_email instead of username", async () => {
    mockRequest.mockResolvedValue({ access_token: "tok", token_type: "Bearer" });

    await authService.login({ username: "admin", password: "secret" });

    expect(mockRequest).toHaveBeenCalledOnce();
    const call = mockRequest.mock.calls[0][0];
    const body = JSON.parse(call.body as string);
    expect(body).toHaveProperty("username_or_email", "admin");
    expect(body).not.toHaveProperty("username");
  });

  it("sends the password unchanged", async () => {
    mockRequest.mockResolvedValue({ access_token: "tok", token_type: "Bearer" });

    await authService.login({ username: "admin", password: "hunter2" });

    const body = JSON.parse(mockRequest.mock.calls[0][0].body as string);
    expect(body).toHaveProperty("password", "hunter2");
  });

  it("POSTs to /auth/login", async () => {
    mockRequest.mockResolvedValue({ access_token: "tok", token_type: "Bearer" });

    await authService.login({ username: "admin", password: "secret" });

    const call = mockRequest.mock.calls[0][0];
    expect(call.method).toBe("POST");
    expect(call.url).toContain("/auth/login");
  });

  it("returns the token response from the API", async () => {
    mockRequest.mockResolvedValue({ access_token: "abc123", token_type: "Bearer" });

    const result = await authService.login({ username: "admin", password: "secret" });

    expect(result).toEqual({ access_token: "abc123", token_type: "Bearer" });
  });
});
