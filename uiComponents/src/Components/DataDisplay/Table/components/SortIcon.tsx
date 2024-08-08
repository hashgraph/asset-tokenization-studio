import { IconButton } from "@Components/Interaction/IconButton";
import type { SortDirection } from "@tanstack/react-table";
import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { TableThemeStyle } from "../Table";
import { CustomIcon } from "@/Components";

export interface SortIconProps {
  type: SortDirection | false;
  onSort: React.MouseEventHandler<HTMLButtonElement>;
}

export const SortIcon = ({ type, onSort }: SortIconProps) => {
  const isSorted = !!type;

  const styles = useChakraMultiStyleConfig("Table", {
    isSorted,
    typeOfSort: type,
  }) as TableThemeStyle;

  return (
    <IconButton
      aria-label="Sort"
      size="xs"
      onClick={onSort}
      variant="tertiary"
      icon={<CustomIcon name="SortingIcon" w={4} h={4} sx={styles.sortIcon} />}
    />
  );
};
