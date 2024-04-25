import React from "react";
import { fireEvent } from "@testing-library/react";
import { render } from "@/test-utils";
import { format, subDays } from "date-fns";
import type { CalendarInputProps } from "./CalendarInput";
import { CalendarInput } from "./CalendarInput";

const defaultProps: CalendarInputProps = {
  value: new Date("2022-05-08T00:00:00Z"),
  onChange: jest.fn(),
};

describe(`< ${CalendarInput.name} />`, () => {
  const componentFactory = (props: CalendarInputProps = defaultProps) =>
    render(<CalendarInput {...props} />);

  test("Should renders correctly", () => {
    const { container } = componentFactory();
    expect(container).toBeInTheDocument();
  });
  test("Should render withTimeInput", () => {
    const { getByLabelText } = componentFactory({
      ...defaultProps,
      withTimeInput: true,
    });
    expect(getByLabelText("Date")).toBeInTheDocument();
  });

  test("Should call onChange when the date is changed", () => {
    const { getByLabelText, getByTestId } = componentFactory();
    const input = getByLabelText("Date");
    fireEvent.click(input);
    const yesterday = subDays(defaultProps.value!, 1);
    const day = getByTestId(`day-${format(yesterday, "dd")}`);
    fireEvent.click(day);
    expect(defaultProps.onChange).toBeCalledTimes(1);
  });

  test("Should call on blur when popup is closing", () => {
    const onBlur = jest.fn();
    const { getByLabelText } = componentFactory({ ...defaultProps, onBlur });
    const input = getByLabelText("Date");
    fireEvent.click(input);
    fireEvent.blur(input);
    expect(onBlur).toBeCalledTimes(1);
  });
});
