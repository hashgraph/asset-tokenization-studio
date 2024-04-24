import React from "react";
import {
  useMultiStyleConfig as useChakraMultiStyleConfig,
  chakra,
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/src/style.css";
import {
  CalendarFooter as Footer,
  CalendarHeader as Caption,
} from "./components";
import type { CalendarThemeStyle } from "./types";
import { useCalendarContext } from "./context";
import { Day } from "./components/Day";

const StyledDatepicker = chakra(DayPicker);

export const CalendarPanel = () => {
  const {
    colorScheme,
    isDisabled: disabled,
    variant,
    withTimeInput,
    ...props
  } = useCalendarContext();

  const styles = useChakraMultiStyleConfig("Calendar", {
    colorScheme,
    disabled,
    variant,
  }) as CalendarThemeStyle;

  return (
    <StyledDatepicker
      sx={styles.container}
      captionLayout="dropdown-buttons"
      components={{
        // TODO:  Agree with the product how it will be implemented
        Footer: withTimeInput ? Footer : undefined,
        Caption,
        Day,
      }}
      mode="single"
      weekStartsOn={1}
      {...props}
    />
  );
};
