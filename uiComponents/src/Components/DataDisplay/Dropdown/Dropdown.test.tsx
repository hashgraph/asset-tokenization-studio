import { render } from "@/test-utils";
import React from "react";
import type { DropdownProps } from "./Dropdown";
import { Dropdown } from "./Dropdown";
import { Menu } from "@chakra-ui/react";
import { DropdownItem } from "./Components";

describe(`<Dropdown />`, () => {
  const factoryComponent = (props?: DropdownProps) =>
    render(
      <Menu isOpen={true}>
        <Dropdown>
          <DropdownItem label="Dropdow Item" isActive />
          <DropdownItem label="Dropdow Item" />
          <DropdownItem label="Dropdow Item" />
          <DropdownItem label="Dropdow Item" />
        </Dropdown>
      </Menu>
    );

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.getAllByTestId("dropdown-item")).toHaveLength(4);
    expect(component.asFragment()).toMatchSnapshot();
  });
});
