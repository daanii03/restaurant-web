import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../admin/StatusBadge";

describe("StatusBadge", () => {
  it('renders "Confirmada" for confirmed status', () => {
    render(<StatusBadge status="confirmed" />);
    const badge = screen.getByText("Confirmada");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-green-400");
  });

  it('renders "Pendiente" for pending status', () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText("Pendiente");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-yellow-400");
  });

  it('renders "Cancelada" for cancelled status', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  it('renders "Completada" for completed status', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });

  it("falls back to the raw status string for unknown statuses", () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});
