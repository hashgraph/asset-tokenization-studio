import React from "react";
import {
  Flex,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { IconButton } from "@Components/Interaction/IconButton";
import { useNavigation } from "react-day-picker";
import { MonthsDropdown } from "./MonthsDropdown";
import { useCalendarContext } from "../../context";
import { YearsDropdown } from "./YearsDropdown";

export const CalendarHeader = () => {
  const navigation = useNavigation();
  const { variant, colorScheme } = useCalendarContext();

  const styles = useChakraMultiStyleConfig("Calendar", {
    colorScheme,
    variant,
  });

  return (
    <Flex sx={styles.header}>
      <IconButton
        icon={<PhosphorIcon as={CaretLeft} />}
        data-testid="previous-month-btn"
        aria-label="Go previous"
        onClick={() => {
          if (navigation.previousMonth) {
            navigation.goToDate(navigation.previousMonth);
          }
        }}
        sx={styles.changeMonthButton}
      />
      <Flex alignItems="center" padding="0.5rem">
        <MonthsDropdown />
        <YearsDropdown />
      </Flex>
      <IconButton
        data-testid="next-month-btn"
        icon={<PhosphorIcon as={CaretRight} />}
        aria-label="Go previous"
        onClick={() => {
          if (navigation.nextMonth) {
            navigation.goToDate(navigation.nextMonth);
          }
        }}
        sx={styles.changeMonthButton}
      />
    </Flex>
  );
};
