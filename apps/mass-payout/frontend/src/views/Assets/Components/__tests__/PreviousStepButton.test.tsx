// SPDX-License-Identifier: Apache-2.0

import { screen } from "@testing-library/react";
import { render } from "../../../../test-utils";
import userEvent from "@testing-library/user-event";
import { PreviousStepButton } from "../PreviousStepButton";

const mockGoToPrevious = jest.fn();

jest.mock("io-bricks-ui", () => ({
  Button: jest.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )),
  useStepContext: () => ({
    goToPrevious: mockGoToPrevious,
  }),
}));

describe("PreviousStepButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render correctly", () => {
      const component = render(<PreviousStepButton />);
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("Interactions", () => {
    it("should call goToPrevious when clicked", async () => {
      const user = userEvent.setup();
      render(<PreviousStepButton />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockGoToPrevious).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple clicks", async () => {
      const user = userEvent.setup();
      render(<PreviousStepButton />);

      const button = screen.getByRole("button");
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockGoToPrevious).toHaveBeenCalledTimes(3);
    });

    it("should not call goToPrevious when disabled", async () => {
      const user = userEvent.setup();
      render(<PreviousStepButton disabled={true} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockGoToPrevious).not.toHaveBeenCalled();
    });
  });
});
