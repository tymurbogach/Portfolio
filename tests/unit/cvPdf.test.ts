import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cvPdfResponse, resetCvCache } from "../../src/lib/cvPdf";

const PDF = new TextEncoder().encode("%PDF-1.4 test");

function upstream(status = 200, etag = '"v1"', body: BodyInit = PDF) {
  return new Response(status === 304 ? null : body, {
    status,
    headers: { ETag: etag },
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  resetCvCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("cvPdfResponse", () => {
  it("serves the upstream PDF as application/pdf", async () => {
    fetchMock.mockResolvedValue(upstream());
    const res = await cvPdfResponse("EN");

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain(
      "TymurBogach_CV_EN.pdf",
    );
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/TymurBogach_CV_EN\.pdf$/);
  });

  it("does not hit upstream again inside the fresh window", async () => {
    fetchMock.mockResolvedValue(upstream());
    await cvPdfResponse("EN");
    await cvPdfResponse("EN");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("revalidates with the ETag after the window and keeps the copy on 304", async () => {
    fetchMock
      .mockResolvedValueOnce(upstream())
      .mockResolvedValueOnce(upstream(304));
    await cvPdfResponse("EN");
    vi.advanceTimersByTime(6 * 60_000);
    const res = await cvPdfResponse("EN");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers["If-None-Match"]).toBe('"v1"');
    expect(res.status).toBe(200);
  });

  it("serves the last good copy when upstream fails", async () => {
    fetchMock
      .mockResolvedValueOnce(upstream())
      .mockRejectedValueOnce(new Error("offline"));
    await cvPdfResponse("EN");
    vi.advanceTimersByTime(6 * 60_000);
    const res = await cvPdfResponse("EN");

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("answers 502 when upstream fails and nothing is cached", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    const res = await cvPdfResponse("ES");

    expect(res.status).toBe(502);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rejects an upstream body that is not a PDF", async () => {
    fetchMock.mockResolvedValue(upstream(200, '"x"', "<html>404</html>"));
    const res = await cvPdfResponse("EN");

    expect(res.status).toBe(502);
  });
});
