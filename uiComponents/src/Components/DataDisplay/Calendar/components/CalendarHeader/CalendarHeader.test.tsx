import React from "react";
import { CalendarHeader } from "./CalendarHeader";
import type { CalendarProviderProps } from "../../context/index";
import { format, addMonths } from "date-fns";
import en from "date-fns/locale/en-US";

import { fireEvent } from "@testing-library/react";
import {
  renderCalendar,
  defaultProps,
  freezeBeforeEach,
} from "../../helpers/test-helpers";
describe(`< ${CalendarHeader.name}/>`, () => {
  const componentFactory = (props: CalendarProviderProps = defaultProps) =>
    renderCalendar(<CalendarHeader />, props);
  test("Should show the formated date and render 12 months", () => {
    const { getByTestId } = componentFactory();
    expect(getByTestId("month-title").textContent).toBe(
      format(defaultProps.selected as Date, "MMMM")
    );
    expect(getByTestId("year-title").textContent).toBe(
      format(defaultProps.selected as Date, "yyyy")
    );
  });

  freezeBeforeEach();

  test("Should change to next month", async () => {
    const { getByTestId } = componentFactory();
    const month = format(defaultProps.selected as Date, "MMMM", {
      locale: en,
    });
    const nextMonth = format(
      addMonths(defaultProps.selected as Date, 1),
      "MMMM",
      {
        locale: en,
      }
    );
    const nextButton = getByTestId("next-month-btn");

    expect(nextButton).toBeInTheDocument();

    expect(getByTestId("month-title").textContent).toBe(month);
    fireEvent.click(nextButton);

    expect(getByTestId("month-title").textContent).toBe(nextMonth);
  });

  test("Should change to previous month", async () => {
    const { getByTestId } = componentFactory();
    const month = format(defaultProps.selected as Date, "MMMM", {
      locale: en,
    });
    const prevMonth = format(
      addMonths(defaultProps.selected as Date, -1),
      "MMMM",
      {
        locale: en,
      }
    );
    const prevButton = getByTestId("previous-month-btn");

    expect(prevButton).toBeInTheDocument();

    expect(getByTestId("month-title").textContent).toBe(month);
    fireEvent.click(prevButton);

    expect(getByTestId("month-title").textContent).toBe(prevMonth);
  });
});
