import React from "react";
import { YearsPanel } from "./YearsPanel";
import type { CalendarProviderProps } from "../../context/index";
import { Menu } from "@chakra-ui/menu";
import { fireEvent } from "@testing-library/react";
import {
  renderCalendar,
  defaultProps as helperDefaultProps,
  freezeBeforeEach,
  defaultDateValue,
} from "../../helpers/test-helpers";

import { subYears, addYears } from "date-fns";

const defaultProps: CalendarProviderProps = {
  ...helperDefaultProps,
  fromDate: subYears(helperDefaultProps.selected as Date, 2),
  toDate: addYears(helperDefaultProps.selected as Date, 2),
};
const currentyear = new Date(defaultDateValue);

describe(`< ${YearsPanel.name}/>`, () => {
  freezeBeforeEach();
  const componentFactory = (props: CalendarProviderProps = defaultProps) =>
    renderCalendar(
      <Menu>
        <YearsPanel />
      </Menu>,
      props
    );

  test("Should change the year", async () => {
    const { getByText } = componentFactory();
    const prevYear = subYears(new Date(defaultDateValue), 1).getFullYear();
    const prevYearButton = getByText(prevYear);
    expect(prevYearButton).toBeInTheDocument();
    expect(getByText(currentyear.getFullYear())).toBeInTheDocument();
    fireEvent.click(prevYearButton);
    expect(getByText(prevYear)).toBeInTheDocument();
  });
});
