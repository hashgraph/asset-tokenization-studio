import { render } from "@/test-utils";
import { Cookie, UserPlus } from "@phosphor-icons/react";
import React from "react";
import type { SidebarItemWithDropdownProps } from "./SidebarItemWithDropdown";
import { SidebarItemWithDropdown } from "./SidebarItemWithDropdown";
import { fireEvent, waitFor } from "@testing-library/react";
import { Menu } from "@chakra-ui/react";
import { SidebarDropdownItem } from "./SidebarDropdownItem";
import { Button } from "@Components/Interaction/Button";

describe(`<SidebarItemWithDropdown />`, () => {
  const defaultProps: SidebarItemWithDropdownProps = {
    label: "Item",
    icon: Cookie,
    children: (
      <>
        <SidebarDropdownItem label="Page 1" icon={UserPlus} />
        <SidebarDropdownItem label="Page 2" icon={UserPlus} isActive={true} />
      </>
    ),
  };
  const factoryComponent = (
    props: SidebarItemWithDropdownProps = defaultProps
  ) =>
    render(
      <Menu>
        <SidebarItemWithDropdown {...props} />
      </Menu>
    );

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders correctly when hovered", async () => {
    const component = factoryComponent();
    fireEvent.mouseEnter(
      component.getByTestId(`sidebar-item-${defaultProps.label}`)
    );

    await waitFor(() => {
      expect(component.asFragment()).toMatchSnapshot("Hovered");
    });
  });

  test("renders correctly with header", () => {
    const component = factoryComponent({
      ...defaultProps,
      header: (
        <Button variant="secondary" size="md">
          Main action
        </Button>
      ),
    });

    expect(component.getByTestId("sidebar-dropdown-header")).toHaveTextContent(
      "Main action"
    );
    expect(component.asFragment()).toMatchSnapshot("WithHeader");
  });
});
