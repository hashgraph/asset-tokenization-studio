import { render } from "@/test-utils";
import React from "react";
import type { HoverableContentProps } from "./HoverableContent";
import { HoverableContent } from "./HoverableContent";
import { Box } from "@chakra-ui/react";
import { fireEvent } from "@testing-library/react";

describe(`<HoverableContent />`, () => {
  const defaultProps = {
    hiddenContent: "Hover",
  };

  const factoryComponent = (props: HoverableContentProps = defaultProps) =>
    render(
      <HoverableContent {...props}>
        <Box>Children</Box>
      </HoverableContent>
    );

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders content when children is hovered", () => {
    const component = factoryComponent();
    const wrapper = component.getByTestId("hoverable-content");

    expect(component.queryByText("Hover")).not.toBeInTheDocument();

    fireEvent.mouseEnter(wrapper);

    expect(component.queryByText("Hover")).toBeInTheDocument();
  });
});
