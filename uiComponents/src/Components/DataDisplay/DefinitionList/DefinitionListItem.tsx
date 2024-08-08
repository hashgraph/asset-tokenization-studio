import React from "react";
import type { FlexProps, TextProps } from "@chakra-ui/react";
import { Box, Text, SkeletonText } from "@chakra-ui/react";
import { ClipboardButton } from "@/Components/Interaction/ClipboardButton";
import { HoverableContent } from "@/Components/Interaction/HoverableContent";

export type BasicDefinitionListItem = {
  title: string;
  description: string | number | React.ReactElement;
  canCopy?: boolean;
  valueToCopy?: string;
  isLoading?: boolean;
};

export interface DefinitionListItemProps extends BasicDefinitionListItem {
  listItemStyles?: FlexProps["sx"];
  listItemTitleStyles?: TextProps["sx"];
  listItemDescriptionStyles?: TextProps["sx"];
}

export const DefinitionListItem = ({
  description,
  title,
  canCopy,
  listItemStyles,
  listItemTitleStyles,
  listItemDescriptionStyles,
  valueToCopy = description.toString(),
  isLoading,
}: DefinitionListItemProps) => {
  return (
    <HoverableContent
      data-testid={`definition-list-item-${title}`}
      sx={listItemStyles}
      hiddenContent={
        !isLoading && canCopy && <ClipboardButton value={valueToCopy} />
      }
    >
      <Text sx={listItemTitleStyles}>{title}</Text>
      {isLoading ? (
        <SkeletonText skeletonHeight={2} flex={1} noOfLines={1} />
      ) : (
        <>
          {React.isValidElement(description) ? (
            <Box sx={listItemDescriptionStyles}>{description}</Box>
          ) : (
            <Text sx={listItemDescriptionStyles}>{description}</Text>
          )}
        </>
      )}
    </HoverableContent>
  );
};
