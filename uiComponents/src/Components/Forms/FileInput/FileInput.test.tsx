import { render } from "@/test-utils";
import React from "react";
import type { FileInputProps } from "./FileInput";
import { FileInput } from "./FileInput";

describe(`<File />`, () => {
  const label = "label";
  const description = "description";
  const defaultProps = {
    label,
    description,
  };
  const isDisabled = { isDisabled: true };
  const isInvalid = { isInvalid: true };

  const factoryComponent = (props: FileInputProps = defaultProps) =>
    render(<FileInput {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly when is disabled", () => {
    const component = factoryComponent({ ...defaultProps, ...isDisabled });
    const container = component.getByTestId("input-file");

    expect(container).toHaveStyle("cursor:not-allowed");
  });

  test("shows correctly when is invalid", () => {
    const component = factoryComponent({ ...defaultProps, ...isInvalid });
    const container = component.getByTestId("input-file");

    expect(container).toHaveStyle(
      "border-color:var(--chakra-colors-error-500)"
    );
  });
});
