import { render } from "@/test-utils";
import { Text } from "@chakra-ui/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { AlertProps, AlertStatus } from "./Alert";
import { Alert } from "./Alert";

describe(`<Alert />`, () => {
  const defaultProps: AlertProps = {
    title: "Title",
    description: "Description",
  };
  const statusList: AlertStatus[] = ["success", "info", "error", "warning"];
  const baseVariantList = ["subtle", "solid", "leftAccent"];
  const factoryComponent = (props: AlertProps = defaultProps) =>
    render(<Alert {...props} />);

  baseVariantList.forEach((variant) => {
    statusList.forEach((status) => {
      test(`renders correctly ${status} alert for variant ${variant}`, () => {
        const component = factoryComponent({
          ...defaultProps,
          status,
          variant,
        });

        expect(component.asFragment()).toMatchSnapshot(
          `Alert-${variant}-${status}`
        );
      });
    });
  });

  test("shows correctly custom children", () => {
    const text = "Example children";
    const component = factoryComponent({ children: <Text>{text}</Text> });

    expect(component.getByText(text)).toBeVisible();
  });

  test("should hide icon when showIcon is false", () => {
    const component = factoryComponent({
      ...defaultProps,
      showIcon: false,
    });

    expect(component.queryByTestId("alert-icon")).not.toBeInTheDocument();
  });

  test("should call onClose when closeBtn is clicked", async () => {
    const onClose = jest.fn();
    const component = factoryComponent({
      ...defaultProps,
      onClose,
    });

    userEvent.click(component.getByLabelText("close-button"));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  test("should show content inline when isInline is true", async () => {
    const component = factoryComponent({
      ...defaultProps,
      isInline: true,
    });

    const alertContentStyle = getComputedStyle(
      component.getByTestId("alert-content")
    );
    expect(alertContentStyle.flexDirection).toBe("row");
  });
});
