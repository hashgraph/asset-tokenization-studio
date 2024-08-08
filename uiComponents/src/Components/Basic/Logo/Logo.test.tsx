import { render } from "@/test-utils";
import React from "react";
import type { LogoProps } from "./Logo";
import { Logo } from "./Logo";

describe(`<Logo />`, () => {
  const defaultProps = {
    width: "100%",
    height: "100px",
    alt: "logo",
  };
  const factoryComponent = (props: LogoProps = defaultProps) =>
    render(<Logo {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.asFragment()).toMatchSnapshot("SizeFull");
  });

  test("renders correctly size iso", () => {
    const component = factoryComponent({ ...defaultProps, size: "iso" });
    expect(component.asFragment()).toMatchSnapshot("SizeISO");
  });
});
