import { render } from "@/test-utils";
import { Cookie } from "@phosphor-icons/react";
import React from "react";
import type { SidebarDropdownItemProps } from "./SidebarDropdownItem";
import { SidebarDropdownItem } from "./SidebarDropdownItem";
import { fireEvent, waitFor } from "@testing-library/react";
import { Menu } from "@chakra-ui/react";

describe(`<SidebarDropdownItem />`, () => {
  const defaultProps: SidebarDropdownItemProps = {
    label: "Item",
    icon: Cookie,
  };
  const factoryComponent = (props: SidebarDropdownItemProps = defaultProps) =>
    render(
      <Menu>
        <SidebarDropdownItem {...props} />
      </Menu>
    );

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(
      component.getByTestId("sidebar-dropdown-item-icon")
    ).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders correctly without icon", () => {
    const component = factoryComponent({ label: "Item" });
    expect(
      component.queryByTestId("sidebar-dropdown-item-icon")
    ).not.toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("WithoutIcon");
  });

  test("renders correctly when hovered", async () => {
    const component = factoryComponent();
    fireEvent.mouseEnter(
      component.getByTestId(`sidebar-dropdown-item-${defaultProps.label}`)
    );

    await waitFor(() => {
      expect(component.asFragment()).toMatchSnapshot("Hovered");
    });
  });

  test("renders correctly when it's disabled", async () => {
    const component = factoryComponent({ ...defaultProps, isDisabled: true });

    await waitFor(() => {
      expect(component.asFragment()).toMatchSnapshot("Disabled");
    });
  });

  test("renders correctly when it's active", async () => {
    const component = factoryComponent({ ...defaultProps, isActive: true });

    await waitFor(() => {
      expect(component.asFragment()).toMatchSnapshot("Active");
    });
  });
});
