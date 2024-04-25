import type { PhosphorIconProps } from "@/Components/Foundations/PhosphorIcon";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import type { MenuItemProps as ChakraMenuItemProps } from "@chakra-ui/react";
import { MenuItem as ChakraMenuItem } from "@chakra-ui/react";
import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { SidebarDropdownThemeStyle } from "./SidebarItemWithDropdown";

export interface SidebarDropdownItemProps extends ChakraMenuItemProps {
  label: string;
  icon?: PhosphorIconProps["as"];
  isDisabled?: boolean;
  isActive?: boolean;
}
export const SidebarDropdownItem = ({
  label,
  icon,
  isDisabled,
  isActive,
  ...props
}: SidebarDropdownItemProps) => {
  const styles = useChakraMultiStyleConfig("SidebarDropdown", {
    isActive,
    isDisabled,
  }) as SidebarDropdownThemeStyle;

  return (
    <ChakraMenuItem
      as="button"
      data-testid={`sidebar-dropdown-item-${label}`}
      disabled={isDisabled}
      {...props}
      sx={styles.itemContainer}
    >
      {icon && (
        <PhosphorIcon
          data-testid="sidebar-dropdown-item-icon"
          as={icon}
          size="xs"
          weight={styles.itemIconWeight}
        />
      )}
      <Text sx={styles.itemLabel}>{label}</Text>
    </ChakraMenuItem>
  );
};
