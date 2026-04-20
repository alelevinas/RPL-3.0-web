import { describe, it, expect, vi, beforeEach } from "vitest";
import * as submissionsService from "@/services/submissionsService";
import * as requestModule from "@/lib/request";

vi.mock("@/lib/request", () => ({
  request: vi.fn(),
}));

const mockRequest = vi.mocked(requestModule.request);

beforeEach(() => {
  mockRequest.mockReset();
});

describe("submit", () => {
  it("sends FormData (not JSON body)", async () => {
    mockRequest.mockResolvedValue({ id: 1 });

    await submissionsService.submit(1, 2, { "main.c": "#include <stdio.h>" });

    const call = mockRequest.mock.calls[0][0];
    expect(call.formData).toBeInstanceOf(FormData);
    expect(call.body).toBeUndefined();
  });

  it("appends each file as submission_files with the correct filename", async () => {
    mockRequest.mockResolvedValue({ id: 1 });

    await submissionsService.submit(1, 2, { "main.c": "int main(){}", "lib.c": "void foo(){}" });

    const fd = mockRequest.mock.calls[0][0].formData as FormData;
    const files = fd.getAll("submission_files") as File[];
    const names = files.map((f) => f.name).sort();
    expect(names).toEqual(["lib.c", "main.c"]);
  });

  it("POSTs to the correct submissions URL", async () => {
    mockRequest.mockResolvedValue({ id: 1 });

    await submissionsService.submit(3, 7, { "sol.py": "print(1)" });

    const call = mockRequest.mock.calls[0][0];
    expect(call.method).toBe("POST");
    expect(call.url).toContain("/courses/3/activities/7/submissions");
  });
});

describe("reprocessAll", () => {
  it("POSTs to /submissions/reprocessAll", async () => {
    mockRequest.mockResolvedValue([]);

    await submissionsService.reprocessAll();

    const call = mockRequest.mock.calls[0][0];
    expect(call.method).toBe("POST");
    expect(call.url).toContain("/submissions/reprocessAll");
  });

  it("returns the list of requeued submissions", async () => {
    const fakeList = [{ id: 1 }, { id: 2 }];
    mockRequest.mockResolvedValue(fakeList);

    const result = await submissionsService.reprocessAll();

    expect(result).toEqual(fakeList);
  });
});
