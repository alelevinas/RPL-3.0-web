import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CustomSnackbar from "@/components/CustomSnackbar";

describe("CustomSnackbar", () => {
  it("renders a plain string message", () => {
    render(
      <CustomSnackbar open message="Something went wrong" severity="error" onClose={vi.fn()} />
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders when message is a FastAPI validation error object", () => {
    // FastAPI returns detail as an array of objects: [{ type, loc, msg, input }]
    // Callers extract detail and pass it to setError, which may be an object.
    const validationError = { type: "value_error", loc: ["body", "name"], msg: "field required", input: null } as unknown;

    expect(() => {
      render(
        <CustomSnackbar open message={validationError as string} severity="error" onClose={vi.fn()} />
      );
    }).not.toThrow();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders when message is an array of validation errors", () => {
    // FastAPI detail can be an array
    const validationErrors = [
      { type: "value_error", loc: ["body", "name"], msg: "field required", input: null },
      { type: "value_error", loc: ["body", "email"], msg: "invalid email", input: "bad" },
    ] as unknown;

    expect(() => {
      render(
        <CustomSnackbar open message={validationErrors as string} severity="error" onClose={vi.fn()} />
      );
    }).not.toThrow();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    // Should display the msg fields joined
    expect(screen.getByRole("alert").textContent).toContain("field required");
    expect(screen.getByRole("alert").textContent).toContain("invalid email");
  });

  it("renders when message is a generic object without msg field", () => {
    const weirdError = { code: 500, reason: "internal" } as unknown;

    expect(() => {
      render(
        <CustomSnackbar open message={weirdError as string} severity="error" onClose={vi.fn()} />
      );
    }).not.toThrow();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders when message is undefined or null", () => {
    expect(() => {
      render(
        <CustomSnackbar open message={undefined as unknown as string} severity="error" onClose={vi.fn()} />
      );
    }).not.toThrow();

    expect(() => {
      render(
        <CustomSnackbar open message={null as unknown as string} severity="error" onClose={vi.fn()} />
      );
    }).not.toThrow();
  });
});
