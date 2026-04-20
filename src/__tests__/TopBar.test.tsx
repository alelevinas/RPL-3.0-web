import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TopBar from "@/components/TopBar";
import * as submissionsService from "@/services/submissionsService";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock("@/theme/ThemeProvider", () => ({
  useThemeMode: () => ({ isDark: false, toggle: vi.fn() }),
}));

vi.mock("@/services/submissionsService", () => ({
  reprocessAll: vi.fn(),
}));

const mockReprocessAll = vi.mocked(submissionsService.reprocessAll);

function makeState(isAdmin: boolean) {
  return {
    token: "tok",
    profile: { name: "Ada", surname: "L", is_admin: isAdmin },
    permissions: [],
    invalidate: vi.fn(),
    set: vi.fn(),
  };
}

beforeEach(() => {
  mockReprocessAll.mockReset();
});

vi.mock("@/lib/state", () => ({
  useAppState: vi.fn(),
}));

import { useAppState } from "@/lib/state";
const mockUseAppState = vi.mocked(useAppState);

describe("TopBar — reprocess button", () => {
  it("is NOT visible for non-admin users", () => {
    mockUseAppState.mockReturnValue(makeState(false) as ReturnType<typeof useAppState>);
    render(<TopBar />);
    expect(screen.queryByLabelText("reprocess stuck submissions")).toBeNull();
  });

  it("is visible for admin users", () => {
    mockUseAppState.mockReturnValue(makeState(true) as ReturnType<typeof useAppState>);
    render(<TopBar />);
    expect(screen.getByLabelText("reprocess stuck submissions")).toBeTruthy();
  });

  it("calls reprocessAll when clicked", async () => {
    mockUseAppState.mockReturnValue(makeState(true) as ReturnType<typeof useAppState>);
    mockReprocessAll.mockResolvedValue([{ id: 1 }, { id: 2 }] as ReturnType<typeof mockReprocessAll> extends Promise<infer T> ? T : never);
    render(<TopBar />);

    fireEvent.click(screen.getByLabelText("reprocess stuck submissions"));

    await waitFor(() => expect(mockReprocessAll).toHaveBeenCalledOnce());
  });

  it("shows a success snackbar with the count after reprocessing", async () => {
    mockUseAppState.mockReturnValue(makeState(true) as ReturnType<typeof useAppState>);
    mockReprocessAll.mockResolvedValue([{ id: 1 }, { id: 2 }] as ReturnType<typeof mockReprocessAll> extends Promise<infer T> ? T : never);
    render(<TopBar />);

    fireEvent.click(screen.getByLabelText("reprocess stuck submissions"));

    await waitFor(() => screen.getByText("2 submission(s) requeued"));
  });
});
