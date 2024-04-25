import { render } from "@/test-utils";
import React from "react";
import type { CustomIconProps } from "./CustomIcon";
import { Icon } from "./Icon";
import { Moon } from "@phosphor-icons/react";

describe(`<Icon />`, () => {
  const customIcon = "Progress";

  const factoryComponent = (name?: CustomIconProps["name"], as?: any) =>
    render(<Icon name={name} as={as} />);

  test("renders correctly when uses custom icon", () => {
    const component = factoryComponent(customIcon);

    expect(component.asFragment()).toMatchSnapshot("Using custom icon");
  });

  test("renders correctly when uses remix icon", () => {
    const component = factoryComponent(undefined, Moon);

    expect(component.asFragment()).toMatchSnapshot("Using remix icon");
  });

  test("renders correctly when no icon exists", () => {
    expect(() => factoryComponent("other")).toThrowError();
  });

  test("renders correctly when an icon remix is replaced by a custom icon remix", () => {
    const themeCustom = {
      icons: {
        BankFill: {
          viewBox: "0 0 22 22",
          path: [
            <path
              d="M18.5 11C18.5 13.24 17.5186 15.2501 15.9608 16.6251C14.6384 17.7923 12.9024 18.5 11 18.5C6.85786 18.5 3.5 15.1421 3.5 11C3.5 9.05175 4.2422 7.27801 5.46013 5.94425C6.83231 4.44158 8.80584 3.5 11 3.5C15.1421 3.5 18.5 6.85786 18.5 11Z"
              stroke="#0F172A"
            />,
            <path
              d="M10.1668 12.3216L13.9968 8.49121L14.5864 9.08038L10.1668 13.5L7.51514 10.8483L8.1043 10.2591L10.1668 12.3216Z"
              fill="#0F172A"
            />,
            <circle cx="11" cy="11" r="10.5" stroke="#0F172A" />,
          ],
          defaultProps: {
            fill: "none",
          },
        },
      },
    };

    const component = render(<Icon name={"BankFill"} />, themeCustom);

    expect(component.asFragment()).toMatchSnapshot(
      "Using replacing customIcon"
    );
  });
});
