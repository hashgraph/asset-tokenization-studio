import { render } from "@/test-utils";
import { Airplane } from "@phosphor-icons/react";
import React from "react";
import type { PhosphorIconProps } from "./PhosphorIcon";
import { Weight, PhosphorIcon } from "./PhosphorIcon";

describe(`<PhosphorIcon />`, () => {
  const factoryComponent = ({ as }: Partial<PhosphorIconProps> = {}) =>
    render(<PhosphorIcon as={as} />);

  test("renders correctly", () => {
    const component = factoryComponent({ as: Airplane });

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders correctly when passing weight", () => {
    const component = factoryComponent({ as: Airplane, weight: Weight.Bold });

    expect(component.asFragment()).toMatchSnapshot("WithWeight");
  });

  test("throws error correctly when no icon is passed", () => {
    expect(() => factoryComponent()).toThrow(
      "Icon was not provided in prop `as`."
    );
  });
});
