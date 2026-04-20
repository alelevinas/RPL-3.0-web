import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateActivityPage from "@/app/(private)/courses/[courseId]/activity/create/page";
import * as activitiesService from "@/services/activitiesService";
import type { Category } from "@/types";

vi.mock("next/navigation", () => ({
  useParams: () => ({ courseId: "1" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/components/MonacoEditor", () => ({
  default: ({ onChange }: { onChange: (v: string) => void }) => (
    <textarea data-testid="monaco-editor" onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock("@/services/activitiesService", () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  create: vi.fn(),
}));

const mockGetCategories = vi.mocked(activitiesService.getCategories);
const mockCreateCategory = vi.mocked(activitiesService.createCategory);

const existingCategory: Category = { id: 5, name: "Existing Category", description: "desc" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCategories.mockResolvedValue([existingCategory]);
});

async function renderPage() {
  const user = userEvent.setup();
  render(<CreateActivityPage />);
  // Wait for categories to load
  await waitFor(() => expect(mockGetCategories).toHaveBeenCalledWith(1));
  return user;
}

async function openCategoryDropdown(user: ReturnType<typeof userEvent.setup>) {
  const categoryInput = screen.getByRole("combobox", { name: /category/i });
  await user.click(categoryInput);
}

async function clickCreateNew(user: ReturnType<typeof userEvent.setup>) {
  await openCategoryDropdown(user);
  const createOption = await screen.findByText("Create new category…");
  await user.click(createOption);
}

describe("CreateActivityPage — category dropdown", () => {
  it("lists existing categories in the dropdown", async () => {
    const user = await renderPage();
    await openCategoryDropdown(user);
    expect(await screen.findByRole("option", { name: "Existing Category" })).toBeInTheDocument();
  });

  it("always shows the 'Create new category…' option", async () => {
    const user = await renderPage();
    await openCategoryDropdown(user);
    expect(await screen.findByText("Create new category…")).toBeInTheDocument();
  });

  it("opens the New Category dialog when 'Create new category…' is clicked", async () => {
    const user = await renderPage();
    await clickCreateNew(user);
    expect(await screen.findByRole("dialog", { name: /new category/i })).toBeInTheDocument();
  });
});

describe("CreateActivityPage — new category dialog", () => {
  it("disables the Create button when the name is empty", async () => {
    const user = await renderPage();
    await clickCreateNew(user);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("button", { name: /^create$/i })).toBeDisabled();
  });

  it("enables the Create button once a name is entered", async () => {
    const user = await renderPage();
    await clickCreateNew(user);
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText(/^name/i), "New Cat");
    expect(within(dialog).getByRole("button", { name: /^create$/i })).toBeEnabled();
  });

  it("closes the dialog on Cancel without creating anything", async () => {
    const user = await renderPage();
    await clickCreateNew(user);
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(mockCreateCategory).not.toHaveBeenCalled();
  });

  it("calls createCategory with name and description on submit", async () => {
    const newCat: Category = { id: 99, name: "New Cat", description: "Some desc" };
    mockCreateCategory.mockResolvedValue(newCat);

    const user = await renderPage();
    await clickCreateNew(user);
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText(/^name/i), "New Cat");
    await user.type(within(dialog).getByLabelText(/description/i), "Some desc");
    await user.click(within(dialog).getByRole("button", { name: /^create$/i }));

    await waitFor(() =>
      expect(mockCreateCategory).toHaveBeenCalledWith(1, { name: "New Cat", description: "Some desc" })
    );
  });

  it("calls createCategory without description when description is blank", async () => {
    const newCat: Category = { id: 99, name: "New Cat" };
    mockCreateCategory.mockResolvedValue(newCat);

    const user = await renderPage();
    await clickCreateNew(user);
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText(/^name/i), "New Cat");
    await user.click(within(dialog).getByRole("button", { name: /^create$/i }));

    await waitFor(() =>
      expect(mockCreateCategory).toHaveBeenCalledWith(1, { name: "New Cat", description: undefined })
    );
  });

  it("closes the dialog and appends the new category after success", async () => {
    const newCat: Category = { id: 99, name: "New Cat" };
    mockCreateCategory.mockResolvedValue(newCat);

    const user = await renderPage();
    await clickCreateNew(user);
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText(/^name/i), "New Cat");
    await user.click(within(dialog).getByRole("button", { name: /^create$/i }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    // New category now appears in the dropdown
    await openCategoryDropdown(user);
    expect(await screen.findByRole("option", { name: "New Cat" })).toBeInTheDocument();
  });

  it("auto-selects the newly created category", async () => {
    const newCat: Category = { id: 99, name: "New Cat" };
    mockCreateCategory.mockResolvedValue(newCat);

    const user = await renderPage();
    await clickCreateNew(user);
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText(/^name/i), "New Cat");
    await user.click(within(dialog).getByRole("button", { name: /^create$/i }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("combobox", { name: /category/i })).toHaveTextContent("New Cat");
  });

  it("shows an error snackbar and keeps the dialog open when createCategory fails", async () => {
    mockCreateCategory.mockRejectedValue({ err: { detail: "Category name already taken" } });

    const user = await renderPage();
    await clickCreateNew(user);
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText(/^name/i), "Duplicate");
    await user.click(within(dialog).getByRole("button", { name: /^create$/i }));

    await waitFor(() => expect(screen.getByText("Category name already taken")).toBeInTheDocument());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
