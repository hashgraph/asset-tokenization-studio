import React from "react";
import { CalendarFooter } from "./CalendarFooter";
import type { CalendarProviderProps } from "../../context/index";
import { fireEvent } from "@testing-library/react";
import {
  renderCalendar,
  defaultProps,
  defaultDateValue,
} from "../../helpers/test-helpers";
import { getZone } from "../../helpers";

const withTimeInputProps: CalendarProviderProps = {
  ...defaultProps,
  withTimeInput: true,
};

jest.mock("../../helpers", () => ({
  ...jest.requireActual("../../helpers"),
  parseTimeInputValue: jest.fn(() => new Date(defaultDateValue)),
}));

describe(`< ${CalendarFooter.name}/>`, () => {
  const componentFactory = (
    props: CalendarProviderProps = withTimeInputProps
  ) => renderCalendar(<CalendarFooter />, props);
  test("Should renders without correctly", () => {
    const { container } = componentFactory(defaultProps);
    expect(container).toBeInTheDocument();
  });
  test("Should renders with time input correctly", () => {
    const { container } = componentFactory();
    expect(container).toBeInTheDocument();
  });
  test("Should show GMT zone", () => {
    const { getByText } = componentFactory();
    expect(getByText(getZone())).toBeInTheDocument();
  });
  test(`the input should change value and displays in format`, () => {
    const { getByTestId } = componentFactory();
    const input = getByTestId("time-input");
    fireEvent.change(input, { target: { value: "12:00:00" } });

    expect(input).toHaveValue("12:00:00");
    expect(defaultProps.onChange).toBeCalledTimes(1);
  });
});
