import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "../Calendar";

afterEach(cleanup);

beforeEach(() => {
  vi.stubGlobal("window", {
    ...window,
    __HOURS_CONFIG: {
      "0": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
      "1": { closed: true },
      "2": { slots: [["07:30", "16:00"]] },
      "3": { slots: [["07:30", "16:00"]] },
      "4": { slots: [["07:30", "16:00"]] },
      "5": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
      "6": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
    },
  });
});

describe("Calendar", () => {
  it("renders month and year header", () => {
    render(<Calendar value="" onChange={() => {}} />);
    const header = screen.getByText(/Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre/);
    expect(header).toBeInTheDocument();
  });

  it("renders day headers (Lun-Dom)", () => {
    render(<Calendar value="" onChange={() => {}} />);
    for (const day of ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }
  });

  it("renders navigation buttons", () => {
    render(<Calendar value="" onChange={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(2); // prev, next + day cells
  });

  it("shows selected date highlighted", () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    futureDate.setDate(15);
    const dateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, "0")}-15`;

    render(<Calendar value={dateStr} onChange={() => {}} />);
    const dayButtons = screen.getAllByRole("button");
    const selected = dayButtons.find((btn) => btn.className.includes("bg-brand-red"));
    expect(selected).toBeTruthy();
  });

  it("calls onChange when clicking a future valid day", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Calendar value="" onChange={onChange} />);

    const dayButtons = screen.getAllByRole("button");
    // Skip first 2 buttons (prev/next nav) and filter for non-disabled day cells
    const validDay = dayButtons.find(
      (btn) => !btn.disabled && !btn.querySelector("svg"),
    );
    if (validDay) {
      await user.click(validDay);
      expect(onChange).toHaveBeenCalledOnce();
      const dateStr = onChange.mock.calls[0][0];
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("does not call onChange when clicking a disabled day", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Calendar value="" onChange={onChange} />);

    const dayButtons = screen.getAllByRole("button");
    const disabledDay = dayButtons.find(
      (btn) => btn.disabled && !btn.querySelector("svg"),
    );
    if (disabledDay) {
      await user.click(disabledDay);
      expect(onChange).not.toHaveBeenCalled();
    }
  });
});
