import React from "react";
import {} from "@chakra-ui/utils";
import { render } from "@/test-utils";
import { fireEvent } from "@testing-library/react";
import type { ClipboardButtonProps } from "./ClipboardButton";
import { ClipboardButton } from "./ClipboardButton";

const onCopyMock = jest.fn();
jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  useClipboard: jest.fn(() => ({
    hasCopied: false,
    onCopy: onCopyMock,
  })),
}));

describe(`< ${ClipboardButton.name}/>`, () => {
  const defaultProps: ClipboardButtonProps = {
    value: "Hola mundo",
  };

  const factoryComponent = (props: Partial<ClipboardButtonProps> = {}) => {
    return render(<ClipboardButton {...defaultProps} {...props} />);
  };

  it("should render without crashing", () => {
    const { asFragment } = factoryComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it("should copy to clipboard", () => {
    const { getByRole } = factoryComponent();
    const button = getByRole("button");
    fireEvent.click(button);
    expect(onCopyMock).toHaveBeenCalledTimes(1);
  });
});
