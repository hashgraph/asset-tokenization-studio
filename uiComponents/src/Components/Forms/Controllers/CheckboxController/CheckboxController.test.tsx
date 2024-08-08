import React from "react";
import { CheckboxController } from "./CheckboxController";
import type { CheckboxControllerProps as BaseCheckboxControllerProps } from "./CheckboxController";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { act, waitFor, fireEvent } from "@testing-library/react";
import { render } from "@/test-utils";

const fieldRequired = "This field is required";

describe(`<CheckboxController />`, () => {
  type CheckboxControllerProps = Omit<
    BaseCheckboxControllerProps<FieldValues>,
    "control"
  >;

  const defaultProps = {
    defaultValue: false,
    id: "testCheckbox",
  };

  let form: UseFormReturn;

  const RenderWithForm = (props: CheckboxControllerProps) => {
    const localForm = useForm();
    form = localForm;
    return <CheckboxController control={localForm.control} {...props} />;
  };

  const factoryComponent = (props: CheckboxControllerProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  test("checkbox should be rendered with checked if defaultValue is true", async () => {
    const component = factoryComponent({ ...defaultProps, defaultValue: true });

    await waitFor(() => {
      expect(
        component.container.querySelector(`#${defaultProps.id}`)
      ).toBeChecked();
    });
  });

  test("should be able to check the checkbox", async () => {
    const component = factoryComponent();

    await waitFor(() => {
      expect(form.getValues()[defaultProps.id]).toEqual(false);
    });

    act(() => {
      fireEvent.click(component.getByTestId(defaultProps.id));
    });

    await waitFor(() => {
      expect(form.getValues()[defaultProps.id]).toEqual(true);
    });
  });

  test("should be able to set errors from outside", async () => {
    const component = factoryComponent();

    act(() => {
      form.setError(defaultProps.id, { type: "invalid" });
    });

    await waitFor(() => {
      expect(
        component.container.querySelector(`#${defaultProps.id}`)
      ).toBeInvalid();
    });
  });

  test("should fire custom onChange", async () => {
    const onChange = jest.fn();
    const component = factoryComponent({ ...defaultProps, onChange });
    const checkbox = component.getByTestId(defaultProps.id);
    act(() => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  //TODO: fix test
  test.skip("should show error at the bottom", async () => {
    const component = factoryComponent({
      ...defaultProps,
      rules: { required: true },
    });
    const checkbox = component.getByTestId(defaultProps.id);

    act(() => {
      fireEvent.click(checkbox);
    });

    act(() => {
      fireEvent.click(checkbox);
    });
    act(() => {
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      const FormErrorMessage = component.getByTestId("form-error-message");
      expect(FormErrorMessage).toBeInTheDocument();
      expect(FormErrorMessage).toHaveTextContent(fieldRequired);
    });

    expect(component.asFragment()).toMatchSnapshot("RenderWithInvalid");
  });
});
