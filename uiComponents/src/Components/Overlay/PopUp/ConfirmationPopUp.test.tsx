import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils";
import type { ConfirmationPopUpProps } from "./ConfirmationPopUp";
import { ConfirmationPopUp } from "./ConfirmationPopUp";

const defaultProps: ConfirmationPopUpProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  confirmationText: "Confirmation text",
  onCloseComplete: jest.fn(),
  errorMessage: "Error message",
};

describe(`<${ConfirmationPopUp.name}/>`, () => {
  const factoryComponent = (props?: Partial<ConfirmationPopUpProps>) =>
    render(<ConfirmationPopUp {...defaultProps} {...props} />);

  it("should render the default component", () => {
    const { asFragment } = factoryComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it("should call onConfirm when type de correct word and clicks on confirm button", async () => {
    factoryComponent();

    const input = screen.getByPlaceholderText(defaultProps.confirmationText!);
    await userEvent.type(input, defaultProps.confirmationText);
    const okButton = screen.getByLabelText("ok-button");

    await userEvent.click(okButton);

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it("should not call onSubmit when clicks on confirm button if is wrong confirmation text", async () => {
    factoryComponent(defaultProps);
    const input = screen.getByPlaceholderText(defaultProps.confirmationText!);
    await userEvent.type(input, "Wrong word!");
    const okButton = screen.getByLabelText("ok-button");

    expect(okButton).toBeDisabled();

    await userEvent.click(okButton);

    expect(defaultProps.onConfirm).not.toHaveBeenCalled();

    expect(screen.getByText(defaultProps.errorMessage!)).toBeInTheDocument();
  });
});
