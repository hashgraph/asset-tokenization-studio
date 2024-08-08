import {
  Box as ChakraBox,
  Menu as ChakraMenu,
  MenuButton as ChakraMenuButton,
  MenuList as ChakraMenuList,
  Stack as ChakraStack,
  useDisclosure as useChakraDisclosure,
} from "@chakra-ui/react";
import React from "react";
import type { SidebarItemProps } from "./SidebarItem";
import { SidebarItem } from "./SidebarItem";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";

import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { Weight } from "@/Components/Foundations/PhosphorIcon";

export interface SidebarItemWithDropdownProps extends SidebarItemProps {
  header?: React.ReactElement;
  children: React.ReactElement | React.ReactElement[];
}

export const sidebarDropdownPartsList: Array<
  | "header"
  | "wrapper"
  | "container"
  | "itemIconWeight"
  | "itemLabel"
  | "itemContainer"
> = [
  "header",
  "wrapper",
  "container",
  "itemIconWeight",
  "itemLabel",
  "itemContainer",
];

type Parts = typeof sidebarDropdownPartsList;

export type SidebarDropdownConfigProps = {
  isDisabled?: boolean;
  hasHeader?: boolean;
  isActive?: boolean;
};

export interface SidebarDropdownThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (({
        hasHeader,
        isDisabled,
        isActive,
      }: SidebarDropdownConfigProps) => Partial<SidebarDropdownThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

export type SidebarDropdownThemeStyle = Record<
  Parts[number],
  ChakraSystemStyleObject
> & {
  itemIconWeight: Weight;
};

export const SidebarItemWithDropdown = ({
  label,
  header,
  icon,
  children,
  isActive,
  isDisabled,
}: SidebarItemWithDropdownProps) => {
  const styles = useChakraMultiStyleConfig("SidebarDropdown", {
    hasHeader: !!header,
  }) as SidebarDropdownThemeStyle;
  const { isOpen, onOpen, onClose } = useChakraDisclosure();

  return (
    <ChakraMenu placement="right-start" gutter={0} isOpen={isOpen}>
      <ChakraMenuButton
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        as={SidebarItem}
        label={label}
        icon={icon}
        isActive={isActive}
        isDisabled={isDisabled}
      />
      <ChakraMenuList
        position="relative"
        sx={styles.wrapper}
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
        {header && (
          <ChakraBox data-testid="sidebar-dropdown-header" sx={styles.header}>
            {header}
          </ChakraBox>
        )}
        <ChakraStack spacing={1} sx={styles.container}>
          {children}
        </ChakraStack>
      </ChakraMenuList>
    </ChakraMenu>
  );
};
