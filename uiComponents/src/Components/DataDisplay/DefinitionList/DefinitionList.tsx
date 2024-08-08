import React from "react";
import type { StackProps as ChakraStackProps } from "@chakra-ui/layout";
import { Flex as ChakraFlex, VStack as ChakraVStack } from "@chakra-ui/layout";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@Theme/Components/BaseMultiStyleConfiguration";
import { Text } from "@chakra-ui/react";
import type { BasicDefinitionListItem } from "./DefinitionListItem";
import { DefinitionListItem } from "./DefinitionListItem";

export const definitionListPartsList: Array<
  | "definitionListGrid"
  | "container"
  | "listTitle"
  | "listItem"
  | "listItemTitle"
  | "listItemDescription"
> = [
  "listTitle",
  "listItem",
  "listItemTitle",
  "listItemDescription",
  "container",
  "definitionListGrid",
];

type Parts = typeof definitionListPartsList;

export interface DefinitionListThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export interface DefinitionStylesProps {
  columns: number;
}

export interface DefinitionListProps extends ChakraStackProps {
  title?: string;
  items: BasicDefinitionListItem[];
  variant?: string;
  isLoading?: boolean;
}

export const DefinitionList = ({
  variant,
  title,
  items,
  isLoading,
  ...props
}: DefinitionListProps) => {
  const styles = useChakraMultiStyleConfig("DefinitionList", {
    variant,
  });

  return (
    <ChakraVStack spacing={0} sx={styles.container} {...props}>
      {title && (
        <ChakraFlex sx={styles.listItem}>
          <Text sx={styles.listTitle}>{title}</Text>
        </ChakraFlex>
      )}
      {items.map((item, index) => (
        <DefinitionListItem
          key={index}
          isLoading={isLoading || item.isLoading}
          listItemStyles={styles.listItem}
          listItemTitleStyles={styles.listItemTitle}
          listItemDescriptionStyles={styles.listItemDescription}
          {...item}
        />
      ))}
    </ChakraVStack>
  );
};
