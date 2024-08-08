import { waitFor } from "@testing-library/react";
import type { UseFormReturn } from "react-hook-form";
import { useController, useForm } from "react-hook-form";
import type { FieldControllerProps } from "./FieldController";
import { FieldController } from "./FieldController";
import React from "react";
import { render } from "@/test-utils";
import { act } from "react-dom/test-utils";

type DefaultProps = Omit<FieldControllerProps, "fieldState">;
const fieldRequired = "This field is required";

describe(`<FieldController />`, () => {
  const defaultProps: DefaultProps = {
    showErrors: true,
    errorMessageVariant: "solid",
    children: <input type="text" data-testid="input" />,
  };

  let form: UseFormReturn;
  const RenderWithForm = (props: DefaultProps) => {
    const localForm = useForm({
      mode: "onChange",
      criteriaMode: "all",
    });
    form = localForm;
    const { control } = localForm;
    const { fieldState } = useController({
      name: "field",
      control,
      rules: { required: fieldRequired },
    });

    return <FieldController fieldState={fieldState} {...props} />;
  };

  const factoryComponent = (props: DefaultProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  test("Component renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
    expect(component.getByTestId("input")).toBeInTheDocument();
  });

  test("Should show errors when showErrors=true", async () => {
    const component = factoryComponent();
    act(() => {
      form.setError("field", { type: "invalid", message: fieldRequired });
    });

    await waitFor(() => {
      const FormErrorMessage = component.getByTestId("form-error-message");
      expect(FormErrorMessage).toHaveTextContent(fieldRequired);
    });

    expect(component.asFragment()).toMatchSnapshot("WithInvalidMessage");
  });

  test("Should hide errors when showErrors=false", async () => {
    const component = factoryComponent({ ...defaultProps, showErrors: false });
    act(() => {
      form.setError("field", { type: "invalid", message: fieldRequired });
    });

    await waitFor(() => {
      expect(component.queryByTestId("form-error-message")).toBeNull();
    });

    expect(component.asFragment()).toMatchSnapshot(
      "WithInvalidNoFormErrorMessage"
    );
  });
});
