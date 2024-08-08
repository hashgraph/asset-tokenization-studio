import { render } from "@/test-utils";
import React from "react";
import type { HeaderProps } from "./Header";
import { Header } from "./Header";
import { Stack } from "@chakra-ui/react";
import { Logo } from "@/Components/Basic/Logo";
import { Avatar } from "@/Components/Basic/Avatar";

describe(`<Header />`, () => {
  const defaultProps: HeaderProps = {
    leftContent: (
      <Stack data-testid="left-content" spacing={6}>
        <Logo alt="IOB" />
      </Stack>
    ),
    rightContent: (
      <div data-testid="right-content">
        <Avatar />
      </div>
    ),
  };
  const factoryComponent = (props: HeaderProps = defaultProps) =>
    render(<Header {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.getByTestId("header")).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot();
  });
  test("renders correctly only left content", () => {
    const component = factoryComponent({
      leftContent: defaultProps.leftContent,
    });
    expect(component.getByTestId("left-content")).toBeVisible();
    expect(component.queryByTestId("right-content")).toBeNull();
    expect(component.asFragment()).toMatchSnapshot("OnlyLeftContent");
  });

  test("renders correctly only right content", () => {
    const component = factoryComponent({
      rightContent: defaultProps.rightContent,
    });
    expect(component.getByTestId("right-content")).toBeVisible();
    expect(component.queryByTestId("left-content")).toBeNull();
    expect(component.asFragment()).toMatchSnapshot("OnlyRightContent");
  });
});
