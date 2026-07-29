import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn().mockResolvedValue({});

vi.mock("resend", () => {
  return {
    Resend: vi.fn(function () {
      return { emails: { send: sendMock } };
    }),
  };
});

const { escapeHtml, sendEmail } = await import("../email");

describe("escapeHtml", () => {
  it("escapes &", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes <", () => {
    expect(escapeHtml("<tag>")).toBe("&lt;tag&gt;");
  });

  it("escapes >", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('he said "hello"')).toBe("he said &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("handles strings with no special characters", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("escapes all special characters at once", () => {
    const input = `<script>alert("xss") & 'test'</script>`;
    const expected =
      "&lt;script&gt;alert(&quot;xss&quot;) &amp; &#039;test&#039;&lt;/script&gt;";
    expect(escapeHtml(input)).toBe(expected);
  });
});

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends email with correct parameters", async () => {
    await sendEmail({
      to: "test@example.com",
      customerName: "John Doe",
      date: "2026-08-01",
      time: "20:00",
      partySize: 4,
      reservationId: 123,
    });

    expect(sendMock).toHaveBeenCalledOnce();
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toBe("test@example.com");
    expect(call.subject).toContain("Reserva confirmada");
    expect(call.html).toContain("John Doe");
    expect(call.html).toContain("2026-08-01");
    expect(call.html).toContain("20:00");
    expect(call.html).toContain("4");
    expect(call.html).toContain("123");
  });

  it("escapes HTML in customer name", async () => {
    await sendEmail({
      to: "test@example.com",
      customerName: '<script>alert("xss")</script>',
      date: "2026-08-01",
      time: "20:00",
      partySize: 2,
      reservationId: 1,
    });

    const call = sendMock.mock.calls[0][0];
    expect(call.html).toContain("&lt;script&gt;");
    expect(call.html).not.toContain("<script>");
  });

  it("includes cancel URL with token", async () => {
    await sendEmail({
      to: "test@test.com",
      customerName: "Test",
      date: "2026-08-01",
      time: "20:00",
      partySize: 3,
      reservationId: 456,
    });

    const call = sendMock.mock.calls[0][0];
    expect(call.html).toContain("/cancel-reservation/456?token=");
  });
});
