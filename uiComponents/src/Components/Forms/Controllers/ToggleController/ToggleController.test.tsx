import { act, fireEvent, waitFor } from "@testing-library/react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { ToggleControllerProps } from "./ToggleController";
import { ToggleController } from "./ToggleController";
import React from "react";
import { render } from "@/test-utils";

type DefaultProps = Omit<ToggleControllerProps<FieldValues>, "control">;

describe(`<ToggleController />`, () => {
  const defaultProps: DefaultProps = {
    id: "test",
    label: "Hello",
  };

  let form: UseFormReturn;
  const RenderWithForm = (props: DefaultProps) => {
    const localForm = useForm({
      mode: "onChange",
      criteriaMode: "all",
    });
    form = localForm;
    const { control } = localForm;

    return <ToggleController control={control} {...props} />;
  };

  const factoryComponent = (props: DefaultProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  test("Component renders correctly", () => {
    const component = factoryComponent();
    expect(component.getByTestId("test")).toBeInTheDocument();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("Show error at bottom", async () => {
    const component = factoryComponent({
      ...defaultProps,
      showErrors: true,
      rules: {
        validate: { valid: (val: boolean) => !!val || "This is invalid" },
      },
    });
    const toggle = component.getByTestId("test");
    act(() => {
      fireEvent.click(toggle);
    });
    act(() => {
      fireEvent.click(toggle);
    });

    await waitFor(() => {
      const FormErrorMessage = component.getByTestId("form-error-message");
      expect(FormErrorMessage).toBeInTheDocument();
      expect(FormErrorMessage).toHaveTextContent("This is invalid");
    });

    expect(component.asFragment()).toMatchSnapshot("RenderWithInvalid");
  });

  test("enables to set errors from outside", async () => {
    const component = factoryComponent();

    act(() => {
      form.setError("test", { type: "invalid" });
    });

    await waitFor(() => {
      expect(component.getByTestId("test")).toHaveAttribute("data-invalid");
    });
  });

  test("should fire custom onChange", async () => {
    const onChange = jest.fn();
    const component = factoryComponent({ ...defaultProps, onChange });
    const toggle = component.getByTestId("test");
    act(() => {
      fireEvent.click(toggle);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
});
