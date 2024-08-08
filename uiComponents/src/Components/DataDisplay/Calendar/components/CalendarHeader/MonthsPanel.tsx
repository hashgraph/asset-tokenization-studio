/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import {
  Flex,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import { useDayPicker, useNavigation } from "react-day-picker";
import { MenuList } from "@chakra-ui/menu";
import {
  addYears,
  subYears,
  isSameYear,
  isSameMonth,
  startOfMonth,
  isWithinInterval,
  setYear,
  setMonth,
} from "date-fns";
import { Month } from "./Month";
import _ from "lodash";
import { useCalendarContext } from "../../context";

export const MonthsPanel = () => {
  const { goToMonth, currentMonth } = useNavigation();

  const { colorScheme, variant, selected } = useCalendarContext();

  const styles = useChakraMultiStyleConfig("Calendar", {
    colorScheme,
    variant,
  });

  const {
    // From 10 years ago to now (default)
    fromDate: fromDateProp,
    toDate: toDateProp,
    locale,
    formatters: { formatMonthCaption },
  } = useDayPicker();

  const [selectedYear, setSelectedYear] = React.useState<Date>(
    (selected as Date) || currentMonth
  );
  const toDate = React.useMemo(() => {
    if (!toDateProp) return addYears(selectedYear, 1);
    return toDateProp;
  }, [toDateProp, selectedYear]);

  const fromDate = React.useMemo(() => {
    if (!fromDateProp) return subYears(selectedYear, 10);
    return fromDateProp;
  }, [fromDateProp, selectedYear]);

  React.useEffect(() => {
    if (!isSameYear(currentMonth, selectedYear)) {
      setSelectedYear(currentMonth);
    }
  }, [currentMonth]);

  const months = React.useMemo(() => {
    if (!fromDate || !toDate) return [];
    const dropdownMonths: Date[] = [];
    if (isSameYear(fromDate, toDate)) {
      // only display the months included in the range
      const date = startOfMonth(fromDate);
      for (
        let month = fromDate.getMonth();
        month <= toDate.getMonth();
        month++
      ) {
        dropdownMonths.push(setMonth(date, month));
      }
    } else {
      // display all the 12 months
      const date = startOfMonth(selectedYear); // Any date should be OK, as we just need the year
      for (let month = 0; month <= 11; month++) {
        dropdownMonths.push(setMonth(date, month));
      }
    }

    return dropdownMonths;
  }, [fromDate, toDate, selectedYear]);

  const handleChangeMonth = (date: Date) => {
    const newMonthWithCurrentYear = setYear(date, selectedYear.getFullYear());
    goToMonth(newMonthWithCurrentYear);
  };

  const isCurrentMonth = (month: Date) => {
    if (isMonthDisabled(month)) return false;

    const isCurrentMonth = ![
      isSameMonth(month, currentMonth),
      isSameYear(month, selectedYear),
    ].includes(false);

    return isCurrentMonth;
  };

  const isMonthDisabled = (month: Date) => {
    if (!fromDate || !toDate) return false;
    return !isWithinInterval(month, {
      end: toDate,
      start: fromDate,
    });
  };

  return (
    <MenuList sx={styles.dropdownPanel}>
      <Flex
        gap={1}
        width="full"
        height="100%"
        alignItems="flex-start"
        direction="column"
      >
        {months.map((month) => (
          <Month
            key={month.toString()}
            isDisabled={isMonthDisabled(month)}
            isSelected={isCurrentMonth(month)}
            onClick={() => handleChangeMonth(month)}
            label={_.capitalize(
              formatMonthCaption(month, { locale })?.toString()
            )}
          />
        ))}
      </Flex>
    </MenuList>
  );
};
