import React from "react";
import { Popover } from "@chakra-ui/popover";
import type { CalendarInputFieldProps } from "./CalendarInputField";
import { CalendarInputField } from "./CalendarInputField";
import type { CalendarProviderProps } from "@Components/DataDisplay/Calendar";
import { format } from "date-fns";
import {
  renderCalendar,
  defaultProps as defaultHelperProps,
} from "@Components/DataDisplay/Calendar/helpers/test-helpers";

const FORMAT = "dd/MM/yyyy";

const defaultProps: CalendarProviderProps = {
  ...defaultHelperProps,
  inputProps: {
    format: FORMAT,
  },
};

const inputFieldDefaultProps: CalendarInputFieldProps = {
  value: defaultHelperProps.selected as Date,
};

describe(`< ${CalendarInputField.name}/>`, () => {
  const componentFactory = (props: CalendarProviderProps = defaultProps) =>
    renderCalendar(
      <Popover>
        <CalendarInputField {...inputFieldDefaultProps} />
      </Popover>,
      props
    );
  test("Should show the formated date ", () => {
    const { getByDisplayValue } = componentFactory();

    expect(
      getByDisplayValue(format(defaultProps.selected as Date, FORMAT))
    ).toBeInTheDocument();
  });
});
