import React from "react";
import { render } from "@/test-utils";
import en from "date-fns/locale/en-US";
import { RootProvider } from "react-day-picker";
import type { CalendarProviderProps } from "../context";
import { CalendarProvider } from "../context";

export const defaultDateValue = 1482363367071;

export const renderCalendar = (
  ui: React.ReactElement,
  props: CalendarProviderProps
) => {
  return render(
    <CalendarProvider {...props}>
      <RootProvider {...props}>{ui}</RootProvider>
    </CalendarProvider>
  );
};

export const defaultProps: CalendarProviderProps = {
  selected: new Date(defaultDateValue),
  onSelect: jest.fn(),
  onChange: jest.fn(),
  locale: en,
};

export const freezeBeforeEach = () => {
  Date.now = jest.fn(() => defaultDateValue);

  beforeEach(() => {
    jest.useFakeTimers({
      now: defaultDateValue,
    });
  });
};
