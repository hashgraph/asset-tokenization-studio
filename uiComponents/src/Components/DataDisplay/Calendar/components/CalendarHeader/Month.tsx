import React from "react";
import {
  Flex,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import { MenuItem } from "@chakra-ui/menu";
import type { MonthProps } from "../../types";
import { useCalendarContext } from "../../context";

export const Month = ({ isSelected, label, ...props }: MonthProps) => {
  const { colorScheme, variant } = useCalendarContext();
  const styles = useChakraMultiStyleConfig("Calendar", {
    isSelected,
    colorScheme,
    variant,
  });

  return (
    <Flex width="100%">
      <MenuItem sx={styles.month} {...props} justifyItems={"flex-start"}>
        {label}
      </MenuItem>
    </Flex>
  );
};
