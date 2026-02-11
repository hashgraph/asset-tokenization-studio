// SPDX-License-Identifier: Apache-2.0

import { fireEvent } from "@testing-library/react";
import { render, selectCalendar } from "../../../test-utils";
import { waitFor } from "@testing-library/react";
import { DigitalSecurityLockerForm } from "../DigitalSecurityLockerForm";

describe(`${DigitalSecurityLockerForm.name}`, () => {
  test("should render correctly", () => {
    const component = render(<DigitalSecurityLockerForm />);

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should disable the submit button if the form is invalid", () => {
    const component = render(<DigitalSecurityLockerForm />);

    const submitButton = component.getByTestId("create-locker-button");

    expect(submitButton).toBeDisabled();
  });

  test("should validate target Id field", async () => {
    const component = render(<DigitalSecurityLockerForm />);

    fireEvent.change(component.getByTestId("targetId"), {
      target: { value: "0x1234567890abcdef" },
    });

    expect(await component.findByText(/Wrong id/i)).toBeInTheDocument();
  });

  test("should validate amount field", async () => {
    const component = render(<DigitalSecurityLockerForm />);

    fireEvent.change(component.getByTestId("amount"), {
      target: { value: "-1" },
    });

    expect(await component.findByText(/Value should be greater or equal than 0/i)).toBeInTheDocument();
  });

  test("should enable the submit button if the form is valid", async () => {
    const component = render(<DigitalSecurityLockerForm />);

    const submitButton = component.getByTestId("create-locker-button");

    expect(submitButton).toBeDisabled();

    fireEvent.change(component.getByTestId("targetId"), {
      target: { value: "0.0.12345" },
    });

    fireEvent.change(component.getByTestId("amount"), {
      target: { value: "10" },
    });

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    await selectCalendar(component, "expirationDate", tomorrow.getDate().toString().padStart(2, "0"));

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });
});
