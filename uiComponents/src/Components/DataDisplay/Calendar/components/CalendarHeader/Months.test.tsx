import React from "react";
import { MonthsPanel } from "./MonthsPanel";
import type { CalendarProviderProps } from "../../context/index";
import { Menu } from "@chakra-ui/menu";

import {
  renderCalendar,
  defaultProps as helperDefaultProps,
  freezeBeforeEach,
} from "../../helpers/test-helpers";

import { subYears, addYears } from "date-fns";

const defaultProps: CalendarProviderProps = {
  ...helperDefaultProps,
  fromDate: subYears(helperDefaultProps.selected as Date, 2),
  toDate: addYears(helperDefaultProps.selected as Date, 2),
};

describe(`< ${MonthsPanel.name}/>`, () => {
  freezeBeforeEach();
  const componentFactory = (props: CalendarProviderProps = defaultProps) =>
    renderCalendar(
      <Menu>
        <MonthsPanel />
      </Menu>,
      props
    );
  test("Should render 12 months", () => {
    const { getByText } = componentFactory();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    monthNames.forEach((monthName) => {
      expect(getByText(monthName)).toBeInTheDocument();
    });
  });
});
