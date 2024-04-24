/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import {
  Grid,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import { useDayPicker, useNavigation } from "react-day-picker";
import { MenuList } from "@chakra-ui/menu";
import {
  addYears,
  subYears,
  isSameYear,
  isWithinInterval,
  startOfYear,
  setYear,
} from "date-fns";
import _ from "lodash";
import { useCalendarContext } from "../../context";
import { Year } from "./Year";

export const YearsPanel = () => {
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
    formatters: { formatYearCaption },
  } = useDayPicker();

  const [selectedYear, setSelectedYear] = React.useState<Date>(
    selected as Date
  );
  const toDate = React.useMemo(() => {
    if (!toDateProp) return addYears(selectedYear, 1);
    return toDateProp;
  }, [toDateProp, selectedYear]);

  const fromDate = React.useMemo(() => {
    if (!fromDateProp) return subYears(selectedYear, 10);
    return fromDateProp;
  }, [fromDateProp, selectedYear]);

  const years = React.useMemo(() => {
    if (!fromDate || !toDate) return [];

    const years: Date[] = [];
    const fromYear = fromDate.getFullYear();
    const toYear = toDate.getFullYear();
    for (let year = fromYear; year <= toYear; year++) {
      years.push(setYear(startOfYear(new Date()), year));
    }

    return years;
  }, [fromDate, toDate]);

  React.useEffect(() => {
    if (!isSameYear(currentMonth, selectedYear)) {
      setSelectedYear(currentMonth);
    }
  }, [currentMonth]);

  const handleChangeYear = (date: Date) => {
    const newDate = new Date(date.getFullYear(), currentMonth.getMonth());

    goToMonth(newDate);
  };

  const isCurrentYear = (year: Date) => {
    if (isYearDisabled(year)) return false;

    const isCurrentYear = isSameYear(year, selectedYear);

    return isCurrentYear;
  };

  const isYearDisabled = (year: Date) => {
    if (!fromDate || !toDate) return false;
    return !isWithinInterval(year, {
      end: toDate,
      start: fromDate,
    });
  };

  return (
    <MenuList sx={styles.dropdownPanel}>
      <Grid
        templateColumns="repeat(1, 1fr)"
        columnGap={6}
        rowGap={2}
        width="100%"
        height="100%"
        templateRows="repeat(1, 1fr)"
      >
        {years.map((year) => (
          <Year
            key={year.toString()}
            isDisabled={isYearDisabled(year)}
            isSelected={isCurrentYear(year)}
            onClick={() => handleChangeYear(year)}
            label={_.capitalize(
              formatYearCaption(year, { locale })?.toString()
            )}
          />
        ))}
      </Grid>
    </MenuList>
  );
};
