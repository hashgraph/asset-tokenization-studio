import { act, fireEvent, waitFor } from "@testing-library/react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { InputControllerProps } from "./InputController";
import { InputController } from "./InputController";
import React from "react";
import { render } from "@/test-utils";

type DefaultProps = Omit<InputControllerProps<FieldValues>, "control">;
const fieldRequired = "This field is required";

describe(`InputController />`, () => {
  const defaultProps: DefaultProps = {
    placeholder: "Hello",
    rules: { required: fieldRequired },
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

    return <InputController control={control} {...props} />;
  };

  const factoryComponent = (props: DefaultProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  test("Component renders correctly", () => {
    const component = factoryComponent();
    expect(component.getByTestId("test")).toBeInTheDocument();

    const inputField = component.getByTestId("test");
    const { placeholder } = defaultProps;
    expect(inputField).toHaveProperty("placeholder", placeholder);

    expect(component.asFragment()).toMatchSnapshot("RenderWithPlaceholder");
  });

  test("Show error at bottom", async () => {
    const component = factoryComponent();
    const inputField = component.getByTestId("test");
    act(() => {
      fireEvent.change(inputField, { target: { value: "111" } });
    });
    act(() => {
      fireEvent.change(inputField, { target: { value: "" } });
    });

    await waitFor(() => {
      const FormErrorMessage = component.getByTestId("form-error-message");
      expect(FormErrorMessage).toBeInTheDocument();
      expect(FormErrorMessage).toHaveTextContent(fieldRequired);
    });

    expect(component.asFragment()).toMatchSnapshot("RenderWithInvalid");
  });

  test("enables to set errors from outside", async () => {
    const component = factoryComponent();

    act(() => {
      form.setError("test", { type: "invalidCard" });
    });

    await waitFor(() => {
      expect(component.getByTestId("test")).toBeInvalid();
    });
  });

  test("should fire custom onChange", async () => {
    const onChange = jest.fn();
    const component = factoryComponent({ ...defaultProps, onChange });
    const inputField = component.getByTestId("test");
    act(() => {
      fireEvent.change(inputField, { target: { value: "111" } });
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  test("should fire custom onBlur", async () => {
    const onBlur = jest.fn();
    const component = factoryComponent({ ...defaultProps, onBlur });
    const inputField = component.getByTestId("test");
    act(() => {
      fireEvent.change(inputField, { target: { value: "111" } });
      fireEvent.blur(inputField);
    });

    await waitFor(() => {
      expect(onBlur).toHaveBeenCalled();
    });
  });
});
