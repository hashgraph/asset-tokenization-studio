import { act, fireEvent, waitFor } from "@testing-library/react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { InputNumberControllerProps } from "./InputNumberController";
import { InputNumberController } from "./InputNumberController";
import React from "react";
import { render } from "@/test-utils";

type DefaultProps = Omit<InputNumberControllerProps<FieldValues>, "control">;
const fieldRequired = "This field is required";

describe(`<InputNumberController />`, () => {
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

    return <InputNumberController {...props} control={control} />;
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

  test("Should save number in form", async () => {
    const component = factoryComponent();
    const inputField = component.getByTestId("test");
    act(() => {
      fireEvent.change(inputField, { target: { value: "11121,32" } });
    });

    await waitFor(() => {
      expect(form.watch("test")).toBe(11121.32);
      expect(typeof form.watch("test")).toBe("number");
    });
  });

  test("Should show currency in input", async () => {
    const component = factoryComponent({ ...defaultProps, suffix: "€" });
    const inputField = component.getByTestId("test");
    act(() => {
      fireEvent.change(inputField, { target: { value: "11121,32" } });
    });

    await waitFor(() => {
      expect((inputField as HTMLInputElement).value).toBe("11.121,32€");
    });
  });

  test("Show error at bottom", async () => {
    const component = factoryComponent();
    const inputField = component.getByTestId("test");
    act(() => {
      fireEvent.change(inputField, { target: { value: "11121,32" } });
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

  test("should be able to set errors from outside", async () => {
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
