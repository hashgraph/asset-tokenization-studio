import { act, fireEvent, waitFor } from "@testing-library/react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { CalendarInputControllerProps } from "./CalendarInputController";
import { CalendarInputController } from "./CalendarInputController";
import React from "react";
import { render } from "@/test-utils";
import { format, subDays } from "date-fns";

type DefaultProps = Omit<CalendarInputControllerProps<FieldValues>, "control">;
const fieldRequired = "This field is required";

const MOCKED_DATE = "2023-08-23";
describe(`< ${CalendarInputController.name} />`, () => {
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

    return <CalendarInputController control={control} {...props} />;
  };

  const factoryComponent = (props: DefaultProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  beforeAll(() => {
    jest.useFakeTimers({
      now: new Date(MOCKED_DATE),
    });
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  test("Component renders correctly", () => {
    const component = factoryComponent();
    expect(component.getByTestId("test")).toBeInTheDocument();
    const inputField = component.getByTestId("test");
    const { placeholder } = defaultProps;
    expect(inputField).toHaveProperty("placeholder", placeholder);
    expect(component.container).toBeInTheDocument();
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
    const value: Date = new Date(2021, 9, 1);
    const yesterday = subDays(value, 1);
    const component = factoryComponent({ ...defaultProps, onChange, value });
    const inputField = component.getByTestId("test");
    act(() => {
      fireEvent.click(inputField);
    });
    act(() => {
      const day = component.getByTestId(`day-${format(yesterday, "dd")}`);
      fireEvent.click(day);
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
      fireEvent.blur(inputField);
    });
    await waitFor(() => {
      expect(onBlur).toHaveBeenCalled();
    });
  });
});
