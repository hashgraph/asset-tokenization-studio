import { act, fireEvent, waitFor } from "@testing-library/react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { RadioGroupControllerProps } from "./RadioGroupController";
import { RadioGroupController } from "./RadioGroupController";
import React from "react";
import { render } from "@/test-utils";

type DefaultProps = Omit<RadioGroupControllerProps<FieldValues>, "control">;
const fieldRequired = "This field is required";

describe(`<RadioGroupController />`, () => {
  const defaultProps: DefaultProps = {
    rules: { required: fieldRequired },
    id: "test",
    variant: "dark",
    options: [
      { label: "One", value: "1" },
      { label: "Two", value: "2" },
      { label: "Three", value: "3" },
    ],
  };

  const RenderWithForm = (props: DefaultProps) => {
    const localForm = useForm({
      mode: "onChange",
      criteriaMode: "all",
    });
    const { control } = localForm;

    return <RadioGroupController control={control} {...props} />;
  };

  const factoryComponent = (props: DefaultProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  test("Component renders correctly", () => {
    const component = factoryComponent();
    const opt1 = component.getByRole("radio", { name: "One" });
    act(() => {
      fireEvent.click(opt1);
    });
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("Show error at bottom", async () => {
    const component = factoryComponent({
      ...defaultProps,
      showErrors: true,
      rules: {
        validate: {
          notTwoValue: (value: string) =>
            value !== "2" || "This value is not valid",
        },
      },
    });
    act(() => {
      fireEvent.click(component.getByRole("radio", { name: "Two" }));
    });

    await waitFor(() => {
      const FormErrorMessage = component.getByTestId("form-error-message");
      expect(FormErrorMessage).toBeInTheDocument();
      expect(FormErrorMessage).toHaveTextContent("This value is not valid");
    });

    expect(component.asFragment()).toMatchSnapshot("RenderWithInvalid");
  });

  test("should fire custom onChange", async () => {
    const onChange = jest.fn();
    const component = factoryComponent({ ...defaultProps, onChange });
    const opt1 = component.getByRole("radio", { name: "One" });
    act(() => {
      fireEvent.click(opt1);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
});
