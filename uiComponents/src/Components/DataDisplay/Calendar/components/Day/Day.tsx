import React from "react";
import {
  useMultiStyleConfig as useChakraMultiStyleConfig,
  Flex,
} from "@chakra-ui/react";
import { useDayRender, useDayPicker } from "react-day-picker";
import type { ButtonProps } from "@Components/Interaction/Button";
import { Button } from "@Components/Interaction/Button";
import { Tooltip } from "@Components/Overlay/Tooltip";
import type { DayProps as DayComponentProps } from "react-day-picker";
import { useCalendarContext } from "../../context";
import { isSameDay, format } from "date-fns";
import { parseTimeInputValue } from "../../helpers";

export interface DayProps extends ButtonProps, DayComponentProps {}

export const Day: React.FC<DayProps> = (props) => {
  const { displayMonth, date, ...restProps } = props;

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const {
    isHidden: isDayHidden,
    divProps,
    buttonProps,
  } = useDayRender(date, displayMonth, buttonRef);

  const { selected, today } = useDayPicker();

  const isToday = isSameDay(date, today);

  const {
    colorScheme,
    isDisabled: disabled,
    todayTooltip = "Today",
    variant,
    timeInputValue,
    setTimeInputValue,
    disabledWeekends = false,
    disabledWeekdays = [],
    disabledDates = [],
  } = useCalendarContext();

  const styles = useChakraMultiStyleConfig("Calendar", {
    colorScheme,
    disabled,
    variant,
    isDayHidden,
    isSelected: selected ? isSameDay(date, selected as any) : false,
    isToday,
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    buttonProps.onClick?.(event);
    props.onClick?.(event);
    const dateTimeInput = parseTimeInputValue(timeInputValue, selected as Date);
    if (dateTimeInput && !isSameDay(date, dateTimeInput)) {
      setTimeInputValue("");
    }
  };

  const checkDisabled = () => {
    if (disabled) return true;

    if (disabledWeekends && (date.getDay() === 0 || date.getDay() === 6))
      return true;

    if (disabledWeekdays.includes(date.getDay())) return true;

    if (disabledDates.some((disabledDate) => isSameDay(date, disabledDate)))
      return true;

    return buttonProps.disabled;
  };

  const buttonElement = (
    <Flex w="full" h="full" justifyContent="center" alignItems="center">
      <Button
        data-testid={`day-${format(date, "dd")}`}
        variant="none"
        size="none"
        sx={styles.day}
        ref={buttonRef}
        isDisabled={checkDisabled()}
        onClick={handleClick}
        {...restProps}
      >
        {divProps.children}
      </Button>
    </Flex>
  );

  return isToday ? (
    <Tooltip label={todayTooltip} sx={styles.todayTooltip}>
      {buttonElement}
    </Tooltip>
  ) : (
    buttonElement
  );
};
