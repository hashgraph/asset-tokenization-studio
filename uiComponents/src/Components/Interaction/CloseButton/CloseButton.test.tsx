import { render } from "@/test-utils";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { CloseButtonProps } from "./CloseButton";
import { CloseButton } from "./CloseButton";

describe(`<CloseButton />`, () => {
  const defaultProps: CloseButtonProps = {
    onClick: jest.fn(),
  };

  const baseSizesList = ["sm", "md", "lg"];
  const factoryComponent = (props: CloseButtonProps = defaultProps) =>
    render(<CloseButton {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  baseSizesList.forEach((size) => {
    test(`renders correctly with size ${size}`, () => {
      const component = factoryComponent({
        ...defaultProps,
        size,
      });

      expect(component.asFragment()).toMatchSnapshot(`CloseButton-${size}`);
    });
  });

  test("should pass down props", async () => {
    const component = factoryComponent();

    await userEvent.click(component.getByLabelText("close-button"));

    await waitFor(() => {
      expect(defaultProps.onClick).toHaveBeenCalled();
    });
  });
});
