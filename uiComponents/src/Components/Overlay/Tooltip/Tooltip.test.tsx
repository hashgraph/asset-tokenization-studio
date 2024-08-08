import { render } from "@/test-utils";
import { waitFor, fireEvent, screen } from "@testing-library/react";
import React from "react";
import type { TooltipProps } from "./Tooltip";
import { Tooltip } from "./Tooltip";

const HOVER = "Hover";
const TEST = "Test";

describe(`<Tooltip />`, () => {
  const DummyComponent = (
    props: Omit<TooltipProps & { isButtonDisabled?: boolean }, "children">
  ) => {
    const { isButtonDisabled, ...tooltipProps } = props;
    return (
      <Tooltip label={TEST} {...tooltipProps}>
        <button disabled={isButtonDisabled || false}>{HOVER}</button>
      </Tooltip>
    );
  };
  const factoryComponent = (props?: TooltipProps) =>
    render(<DummyComponent {...props} />);

  test("renders correctly default", async () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
    expect(component.getByText(HOVER)).toBeInTheDocument();

    fireEvent.pointerOver(screen.getByText(HOVER));

    await waitFor(() => {
      expect(component.getByText(TEST)).toBeInTheDocument();
    });
  });
});
