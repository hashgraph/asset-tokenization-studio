import type { PhosphorIconProps } from "@/Components/Foundations/PhosphorIcon";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import type { MenuItemProps as ChakraMenuItemProps } from "@chakra-ui/react";
import { MenuItem as ChakraMenuItem } from "@chakra-ui/react";
import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { DropdownThemeStyle } from "../Dropdown";

export interface DropdownItemProps extends ChakraMenuItemProps {
  label: string;
  icon?: PhosphorIconProps["as"];
  isDisabled?: boolean;
  isActive?: boolean;
}
export const DropdownItem = ({
  label,
  icon,
  isDisabled,
  isActive,
  ...props
}: DropdownItemProps) => {
  const styles = useChakraMultiStyleConfig("Dropdown", {
    isActive,
    isDisabled,
  }) as DropdownThemeStyle;

  return (
    <ChakraMenuItem
      data-testid={"dropdown-item"}
      disabled={isDisabled}
      {...props}
      sx={styles.itemContainer}
    >
      {icon && (
        <PhosphorIcon
          data-testid="dropdown-item-icon"
          as={icon}
          size="xxs"
          weight={styles.itemIconWeight}
        />
      )}
      <Text sx={styles.itemLabel}>{label}</Text>
    </ChakraMenuItem>
  );
};
