import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../Input";

afterEach(cleanup);

describe("Input", () => {
  it("renders label and input", () => {
    render(<Input id="name" labelText="Nombre" type="text" />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "name");
  });

  it("shows error message when error prop is set", () => {
    render(<Input id="email" labelText="Email" type="email" error="Email inválido" />);
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    expect(input.className).toContain("border-brand-red");
  });

  it("does not show error paragraph when no error", () => {
    render(<Input id="test" labelText="Test" type="text" />);
    const input = screen.getByLabelText("Test");
    expect(input.className).not.toContain("border-brand-red");
  });

  it("passes additional props to input", () => {
    render(
      <Input
        id="phone"
        labelText="Teléfono"
        type="tel"
        placeholder="666..."
        value="612345678"
        readOnly
      />,
    );
    const input = screen.getByLabelText("Teléfono");
    expect(input).toHaveAttribute("placeholder", "666...");
    expect(input).toHaveValue("612345678");
    expect(input).toHaveAttribute("readOnly");
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    let value = "";
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      value = e.target.value;
    };
    render(<Input id="input-name" labelText="Nombre" type="text" onChange={onChange} />);
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    expect(value).toBe("Ana");
  });
});
