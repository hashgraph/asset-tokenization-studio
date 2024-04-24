import React from "react";
import { format } from "date-fns";
import type { DayProps } from "./Day";
import { Day } from "./Day";
import type { CalendarProviderProps } from "../../context/index";
import { renderCalendar, defaultProps } from "../../helpers/test-helpers";
const DATE_BY_DEFAULT = new Date(2023, 1, 15);

const defaultDayProps: DayProps = {
  date: DATE_BY_DEFAULT,
  displayMonth: DATE_BY_DEFAULT,
};

describe(`< ${Day.name}/>`, () => {
  const componentFactory = (
    props: CalendarProviderProps = defaultProps,
    dayProps: DayProps = defaultDayProps
  ) => renderCalendar(<Day {...dayProps} />, props);
  test("Should show the formated date ", () => {
    const component = componentFactory();
    expect(
      component.getByTestId(`day-${format(defaultDayProps.date, "dd")}`)
    ).toBeInTheDocument();
  });
});
