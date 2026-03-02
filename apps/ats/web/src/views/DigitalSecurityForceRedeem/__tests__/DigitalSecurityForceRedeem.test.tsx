// SPDX-License-Identifier: Apache-2.0

import { DigitalSecurityForceRedeem } from "../DigitalSecurityForceRedeem";
import { render } from "../../../test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: () => ({ id: "0.0.123456" }),
}));

const SOURCE_PLACEHOLDER = "Enter the account";
const AMOUNT_PLACEHOLDER = "Enter the amount to redeem";

describe(`${DigitalSecurityForceRedeem.name}`, () => {
  const factoryComponent = () => {
    return render(<DigitalSecurityForceRedeem />);
  };

  test("render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should show Goback button", () => {
    const component = factoryComponent();

    const breadcrumbs = component.getByTestId("go-back-button");
    expect(breadcrumbs).toBeInTheDocument();
  });

  test("should show breadcrumbs", () => {
    const component = factoryComponent();

    const breadcrumbs = component.getByTestId("breadcrumb-desktop");
    expect(breadcrumbs).toBeInTheDocument();
  });

  test("should form be rendered properly", () => {
    const component = factoryComponent();

    const form = component.getByTestId("force-redeem-form");
    expect(form).toBeInTheDocument();
  });

  test("should render fullRedeem checkbox", () => {
    factoryComponent();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  test("should redeem button be disabled when form is empty", () => {
    factoryComponent();

    const redeemButton = screen.getByTestId("redeem-security-button");
    expect(redeemButton).toBeDisabled();
  });

  test("should redeem button be disabled when only source is filled", async () => {
    factoryComponent();

    const sourceInput = screen.getByPlaceholderText(SOURCE_PLACEHOLDER);
    await userEvent.type(sourceInput, "0x1234567890abcdef");

    const redeemButton = screen.getByTestId("redeem-security-button");
    expect(redeemButton).toBeDisabled();
  });

  test("should redeem button be enabled when source and amount are filled", async () => {
    factoryComponent();

    const sourceInput = screen.getByPlaceholderText(SOURCE_PLACEHOLDER);
    await userEvent.type(sourceInput, "0x1234567890abcdef");

    const amountInput = screen.getByPlaceholderText(AMOUNT_PLACEHOLDER);
    await userEvent.type(amountInput, "100");

    await waitFor(() => {
      const redeemButton = screen.getByTestId("redeem-security-button");
      expect(redeemButton).toBeEnabled();
    });
  });

  test("should redeem button be enabled when source is filled and fullRedeem is checked", async () => {
    factoryComponent();

    const sourceInput = screen.getByPlaceholderText(SOURCE_PLACEHOLDER);
    await userEvent.type(sourceInput, "0x1234567890abcdef");

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    await waitFor(() => {
      const redeemButton = screen.getByTestId("redeem-security-button");
      expect(redeemButton).toBeEnabled();
    });
  });

  test("should disable amount input when fullRedeem is checked", async () => {
    factoryComponent();

    const amountInput = screen.getByPlaceholderText(AMOUNT_PLACEHOLDER);
    expect(amountInput).toBeEnabled();

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(amountInput).toBeDisabled();
    });
  });

  test("should enable amount input when fullRedeem is unchecked", async () => {
    factoryComponent();

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    const amountInput = screen.getByPlaceholderText(AMOUNT_PLACEHOLDER);
    await waitFor(() => {
      expect(amountInput).toBeDisabled();
    });

    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(amountInput).toBeEnabled();
    });
  });

  test("should redeem button be disabled when fullRedeem is checked but source is empty", async () => {
    factoryComponent();

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    const redeemButton = screen.getByTestId("redeem-security-button");
    expect(redeemButton).toBeDisabled();
  });

  test("should clear amount when fullRedeem is checked and unchecked", async () => {
    factoryComponent();

    const amountInput = screen.getByPlaceholderText(AMOUNT_PLACEHOLDER);
    await userEvent.type(amountInput, "100");

    expect(amountInput).toHaveValue("100");

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(amountInput).toHaveValue("");
    });
  });

  test("should keep source value when toggling fullRedeem checkbox", async () => {
    factoryComponent();

    const sourceInput = screen.getByPlaceholderText(SOURCE_PLACEHOLDER);
    await userEvent.type(sourceInput, "0x1234567890abcdef");

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(sourceInput).toHaveValue("0x1234567890abcdef");
    });

    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(sourceInput).toHaveValue("0x1234567890abcdef");
    });
  });
});
