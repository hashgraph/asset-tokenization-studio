import { act, fireEvent, waitFor } from "@testing-library/react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { PasswordControllerProps } from "./PasswordController";
import { PasswordController } from "./PasswordController";
import React from "react";
import { Icon } from "@/Components/Foundations/Icon";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { render } from "@/test-utils";

type DefaultProps = Omit<PasswordControllerProps<FieldValues>, "control">;
const fieldRequired = "This field is required";

describe(`<PasswordController />`, () => {
  const defaultProps: DefaultProps = {
    placeholder: "Hello",
    rules: { required: fieldRequired },
    id: "password",
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

    return <PasswordController control={control} {...props} />;
  };

  const factoryComponent = (props: DefaultProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  test("Component renders correctly", () => {
    const component = factoryComponent();

    const passwordField = component.getByTestId("password");

    const { placeholder } = defaultProps;
    expect(passwordField).toHaveProperty("placeholder", placeholder);

    expect(component.asFragment()).toMatchSnapshot("RenderWithPlaceholder");
  });

  test("Show error at bottom", async () => {
    const component = factoryComponent();
    const passwordField = component.getByTestId("password");
    act(() => {
      fireEvent.change(passwordField, { target: { value: "111" } });
    });
    act(() => {
      fireEvent.change(passwordField, { target: { value: "" } });
    });

    await waitFor(() => {
      const FormErrorMessage = component.getByTestId("form-error-message");
      expect(FormErrorMessage).toBeInTheDocument();
      expect(FormErrorMessage).toHaveTextContent(fieldRequired);
    });

    expect(component.asFragment()).toMatchSnapshot("RenderWithInvalidPassword");
  });

  test("enables to set errors from outside", async () => {
    const component = factoryComponent();

    act(() => {
      form.setError("password", { type: "passwordDoNotMatch" });
    });

    await waitFor(() => {
      expect(component.getByTestId("password")).toBeInvalid();
    });
  });

  test("should be able to hide or show password", async () => {
    const component = factoryComponent();
    const toggleButton = component.getByTestId("toggle-password-visibility");
    const passwordField = component.getByTestId("password");

    expect(toggleButton).toHaveAttribute("aria-label", "Show Password");
    expect(passwordField).toHaveAttribute("type", "password");

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(toggleButton).toHaveAttribute("aria-label", "Hide Password");
    expect(passwordField).toHaveAttribute("type", "text");
  });

  test("should be able to change hide or show password btn icon", async () => {
    const component = factoryComponent({
      ...defaultProps,
      iconShowPassword: <Icon as={Eye} />,
      iconHidePassword: <Icon as={EyeSlash} />,
    });
    const toggleButton = component.getByTestId("toggle-password-visibility");

    expect(component.asFragment()).toMatchSnapshot("RenderWithCustomHideIcon");

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(component.asFragment()).toMatchSnapshot("RenderWithCustomShowIcon");
  });
});
