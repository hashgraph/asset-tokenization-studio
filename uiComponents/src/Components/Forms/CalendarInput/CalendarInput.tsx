import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/react";
import { Popover, PopoverContent } from "@chakra-ui/popover";
import type { CalendarInputFieldProps } from "./CalendarInputField";
import { CalendarInputField } from "./CalendarInputField";
import type { CalendarProviderProps } from "@Components/DataDisplay/Calendar";
import { Calendar } from "@Components/DataDisplay/Calendar";
import _merge from "lodash/merge";

export type CalendarInputProps = CalendarInputFieldProps &
  Partial<
    Pick<
      CalendarProviderProps,
      | "colorScheme"
      | "locale"
      | "todayTooltip"
      | "variant"
      | "withTimeInput"
      | "fromDate"
      | "toDate"
      | "disabledWeekends"
      | "disabledWeekdays"
      | "disabledDates"
    >
  > & {
    onChange?: (date: Date) => void;
    onClose?: () => void;
    onBlur?: () => void;
    calendarProps?: CalendarProviderProps;
  };

export const CalendarInput = ({
  colorScheme,
  locale,
  todayTooltip,
  variant,
  onClose,
  withTimeInput,
  fromDate,
  toDate,
  disabledWeekends,
  disabledWeekdays,
  disabledDates,
  calendarProps: calendarPropsArgs = {},
  ...props
}: CalendarInputProps) => {
  const styles = useChakraMultiStyleConfig("Calendar", {
    colorScheme,
    variant,
    isDisabled: props.isDisabled,
  });

  const calendarProps = _merge<
    CalendarProviderProps,
    CalendarProviderProps,
    CalendarProviderProps
  >(
    {},
    {
      mode: "single",
      colorScheme,
      locale,
      todayTooltip,
      variant,
      onClose,
      withTimeInput,
      fromDate,
      toDate,
      disabledWeekends,
      disabledWeekdays,
      disabledDates,
      selected: props.value,
      onDayClick: props.onChange,
      onChange: props.onChange,
      isDisabled: props.isDisabled,
    },
    calendarPropsArgs
  );

  return (
    <Popover
      isLazy
      onClose={() => {
        props.onBlur?.();
      }}
      placement="bottom-start"
      offset={[0, 4]}
    >
      <CalendarInputField sx={styles.input} {...props} />
      <PopoverContent maxW="none" p={0} bgColor={"transparent"} border={"none"}>
        <Calendar {...calendarProps} />
      </PopoverContent>
    </Popover>
  );
};
