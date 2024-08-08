import { render } from "@/test-utils";
import { Cookie, Gear, House } from "@phosphor-icons/react";
import React from "react";
import type { SidebarProps } from "./Sidebar";
import { Sidebar } from "./Sidebar";
import { Stack } from "@chakra-ui/react";
import { SidebarItem } from "./Components/SidebarItem";

describe(`<Sidebar />`, () => {
  const defaultProps: SidebarProps = {
    topContent: (
      <Stack spacing={6}>
        <SidebarItem label="Home" icon={House} />
        <SidebarItem label="Item molecule" icon={Cookie} isActive />
        <SidebarItem label="Item molecule" icon={Cookie} isDisabled />
      </Stack>
    ),
    bottomContent: <SidebarItem label="Configuration" icon={Gear} />,
  };
  const factoryComponent = (props: SidebarProps = defaultProps) =>
    render(<Sidebar {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });
  test("renders correctly only top content", () => {
    const component = factoryComponent({ topContent: defaultProps.topContent });

    expect(component.asFragment()).toMatchSnapshot("OnlyTopContent");
  });

  test("renders correctly only bottom content", () => {
    const component = factoryComponent({
      topContent: defaultProps.bottomContent,
    });

    expect(component.asFragment()).toMatchSnapshot("OnlyBottomContent");
  });
});
