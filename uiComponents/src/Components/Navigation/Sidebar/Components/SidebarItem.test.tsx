import { render } from "@/test-utils";
import { Cookie } from "@phosphor-icons/react";
import React from "react";
import type { SidebarItemProps } from "./SidebarItem";
import { SidebarItem } from "./SidebarItem";
import { fireEvent, waitFor } from "@testing-library/react";

describe(`<SidebarItem />`, () => {
  const defaultProps: SidebarItemProps = {
    label: "Item",
    icon: Cookie,
  };
  const factoryComponent = (props: SidebarItemProps = defaultProps) =>
    render(<SidebarItem {...props} />);

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
