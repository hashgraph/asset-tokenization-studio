import React from "react";
import { render } from "@/test-utils";
import { fireEvent } from "@testing-library/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Clock } from "@phosphor-icons/react";
import type { PopUpProps } from "./index";
import { PopUp } from "./index";

const defaultProps: PopUpProps = {
  isOpen: true,
  onClose: jest.fn(),
  icon: <PhosphorIcon as={Clock} />,
};

describe(`< ${PopUp.name}/>`, () => {
  const factoryComponent = (props: PopUpProps = defaultProps) =>
    render(<PopUp {...props} />);

  it("should render the default component", () => {
    const { asFragment } = factoryComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it("should call onClose when clicks in closeButton", () => {
    const ariaLabel = "close-button";
    const { getByLabelText } = factoryComponent();
    const closeButton = getByLabelText(ariaLabel);

    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
  it("should render with footer component", () => {
    const props: PopUpProps = {
      ...defaultProps,
      onCancel: jest.fn(),
      onConfirm: jest.fn(),
    };
    const component = factoryComponent(props);

    expect(component.asFragment()).toMatchSnapshot();
  });
  it("should call onCancel when clicks on cancel button", () => {
    const props: PopUpProps = {
      ...defaultProps,
      onCancel: jest.fn(),
      onConfirm: jest.fn(),
    };
    const ariaLabel = "cancel-button";
    const { getByLabelText } = factoryComponent(props);
    const cancelButton = getByLabelText(ariaLabel);

    fireEvent.click(cancelButton);

    expect(props.onCancel).toHaveBeenCalled();
  });
  it("should call onConfirm when clicks on confirm button", () => {
    const props: PopUpProps = {
      ...defaultProps,
      onCancel: jest.fn(),
      onConfirm: jest.fn(),
    };
    const ariaLabel = "ok-button";
    const { getByLabelText } = factoryComponent(props);
    const okButton = getByLabelText(ariaLabel);

    fireEvent.click(okButton);

    expect(props.onConfirm).toHaveBeenCalled();
  });
  it("should render with one button in footer component", () => {
    const props: PopUpProps = {
      ...defaultProps,
      onConfirm: jest.fn(),
    };
    const component = factoryComponent(props);

    expect(component.asFragment()).toMatchSnapshot();
  });
  it("should render with no overlay", () => {
    const props: PopUpProps = {
      ...defaultProps,
      showOverlay: false,
    };
    const component = factoryComponent(props);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
