import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/react";
import { Menu, MenuButton } from "@chakra-ui/menu";
import { CaretDown } from "@phosphor-icons/react";
import { Text } from "@/Components/Foundations/Text";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { Button } from "@Components/Interaction/Button";
import { useDayPicker, useNavigation } from "react-day-picker";
import { YearsPanel } from "./YearsPanel";
import { useCalendarContext } from "../../context";
import _ from "lodash";

export const YearsDropdown = () => {
  const { colorScheme, variant } = useCalendarContext();

  const styles = useChakraMultiStyleConfig("Calendar", {
    colorScheme,
    variant,
  });

  const {
    locale,
    formatters: { formatYearCaption },
  } = useDayPicker();

  const navigation = useNavigation();

  return (
    <Menu placement="bottom" offset={[0, -8]}>
      <MenuButton
        as={Button}
        sx={styles.dropdownButton}
        rightIcon={
          <PhosphorIcon
            as={CaretDown}
            weight={Weight.Fill}
            color="currentColor"
          />
        }
      >
        <Text sx={styles.headerTitle} data-testid="year-title">
          {_.capitalize(
            formatYearCaption(navigation.currentMonth, {
              locale,
            })?.toString() ?? ""
          )}
        </Text>
      </MenuButton>
      <YearsPanel />
    </Menu>
  );
};
