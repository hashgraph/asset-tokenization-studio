import { render } from "@/test-utils";
import { Cookie } from "@phosphor-icons/react";
import React from "react";
import type { DropdownItemProps } from "./DropdownItem";
import { DropdownItem } from "./DropdownItem";
import { fireEvent } from "@testing-library/react";
import { Menu } from "@chakra-ui/react";

describe(`<DropdownItem />`, () => {
  const defaultProps: DropdownItemProps = {
    label: "Item",
    icon: Cookie,
  };
  const factoryComponent = (props: DropdownItemProps = defaultProps) =>
    render(
      <Menu>
        <DropdownItem {...props} />
      </Menu>
    );

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.getByTestId("dropdown-item-icon")).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders correctly without icon", () => {
    const component = factoryComponent({ label: "Item" });
    expect(
      component.queryByTestId("dropdown-item-icon")
    ).not.toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("WithoutIcon");
  });

  test("renders correctly when hovered", async () => {
    const component = factoryComponent();
    fireEvent.mouseEnter(component.getByTestId(`dropdown-item`));

    expect(component.asFragment()).toMatchSnapshot("Hovered");
  });

  test("renders correctly when it's disabled", async () => {
    const component = factoryComponent({ ...defaultProps, isDisabled: true });

    expect(component.asFragment()).toMatchSnapshot("Disabled");
  });

  test("renders correctly when it's active", async () => {
    const component = factoryComponent({ ...defaultProps, isActive: true });

    expect(component.asFragment()).toMatchSnapshot("Active");
  });
});
