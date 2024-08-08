import { render } from "@/test-utils";
import React from "react";
import type { SliderProps } from "./Slider";
import { Slider } from "./Slider";

//@ts-ignore
const { ResizeObserver } = window;

beforeEach(() => {
  //@ts-ignore
  delete window.ResizeObserver;
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

afterEach(() => {
  window.ResizeObserver = ResizeObserver;
  jest.restoreAllMocks();
});

describe(`<Slider />`, () => {
  const defaultProps: SliderProps = {
    defaultValue: 30,
  };

  const factoryComponent = (props: SliderProps = defaultProps) =>
    render(<Slider {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows the default value", () => {
    const defaultValue = 70;
    const component = factoryComponent({ defaultValue });
    const { container } = component;
    expect(container.querySelector("input")?.value).toBe(`${defaultValue}`);
    expect(component.asFragment()).toMatchSnapshot("with default value");
  });

  test("shows horizontal slider", () => {
    const component = factoryComponent({ orientation: "horizontal" });
    expect(component.getByRole("slider")).toBeInTheDocument();
    expect(component.getByRole("slider").getAttribute("aria-orientation")).toBe(
      "horizontal"
    );
    expect(component.asFragment()).toMatchSnapshot("horizontal slider");
  });

  test("shows vertical slider", () => {
    const component = factoryComponent({ orientation: "vertical" });
    expect(component.getByRole("slider")).toBeInTheDocument();
    expect(component.getByRole("slider").getAttribute("aria-orientation")).toBe(
      "vertical"
    );
    expect(component.asFragment()).toMatchSnapshot("vertical slider");
  });
});
