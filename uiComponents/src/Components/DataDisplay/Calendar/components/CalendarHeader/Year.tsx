import React from "react";
import {
  GridItem,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import { MenuItem } from "@chakra-ui/menu";
import type { MonthProps } from "../../types";
import { useCalendarContext } from "../../context";

export const Year = ({ isSelected, label, ...props }: MonthProps) => {
  const { colorScheme, variant } = useCalendarContext();
  const styles = useChakraMultiStyleConfig("Calendar", {
    isSelected,
    colorScheme,
    variant,
  });

  return (
    <GridItem>
      <MenuItem sx={styles.year} {...props}>
        {label}
      </MenuItem>
    </GridItem>
  );
};
