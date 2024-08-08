import { render } from "@testing-library/react";
import React from "react";
import { Textarea } from "./Textarea";

describe(`<Textarea />`, () => {
  const testId = "textareaTest";

  const defaultProps = {};

  const factoryComponent = (props = defaultProps) =>
    render(<Textarea data-testid={testId} {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly when is disabled", () => {
    const component = factoryComponent({ isDisabled: true });
    expect(component.asFragment()).toMatchSnapshot("Using disabled");
  });

  test("shows correctly when is invalid", () => {
    const component = factoryComponent({ isInvalid: true });
    expect(component.asFragment()).toMatchSnapshot("Using invalid");
  });

  test("shows correctly when is success", () => {
    const component = factoryComponent({ isSuccess: true });
    expect(component.asFragment()).toMatchSnapshot("Using success");
  });
});
