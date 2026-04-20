import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(public)/login/page";
import * as authService from "@/services/authenticationService";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock("@/lib/state", () => ({
  useAppState: () => ({ set: vi.fn(), token: null, profile: null, course: null, permissions: null, invalidate: vi.fn() }),
}));

vi.mock("@/services/authenticationService", () => ({
  login: vi.fn(),
  getProfile: vi.fn(),
}));

const mockLogin = vi.mocked(authService.login);
const mockGetProfile = vi.mocked(authService.getProfile);

beforeEach(() => {
  mockLogin.mockReset();
  mockGetProfile.mockReset();
  localStorage.clear();
});

describe("LoginPage", () => {
  it("renders username and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("calls authService.login with the entered credentials", async () => {
    mockLogin.mockResolvedValue({ access_token: "tok", token_type: "Bearer" } as never);
    mockGetProfile.mockResolvedValue({ id: 1, name: "Admin" } as never);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/username or email/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ username: "admin", password: "admin123" }));
  });

  it("shows an error message on failed login", async () => {
    mockLogin.mockRejectedValue({ status: 401, err: { detail: "Invalid credentials" } });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/username or email/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
  });

  it("shows email-not-validated warning when API returns that detail", async () => {
    mockLogin.mockRejectedValue({ status: 401, err: { detail: "Email not validated" } });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/username or email/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText(/validate your email/i)).toBeInTheDocument());
  });

  it("shows session expired notice when localStorage flag is set", () => {
    localStorage.setItem("sessionExpired", "true");
    render(<LoginPage />);
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
  });
});
