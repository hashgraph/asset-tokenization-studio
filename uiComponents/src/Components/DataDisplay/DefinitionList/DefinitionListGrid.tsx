import React from "react";
import type { SimpleGridProps } from "@chakra-ui/layout";
import { SimpleGrid } from "@chakra-ui/layout";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";

export interface DefinitionListGridProps extends SimpleGridProps {
  columns: number;
  variant?: string;
}

export const DefinitionListGrid = ({
  variant,
  ...props
}: DefinitionListGridProps) => {
  const styles = useChakraMultiStyleConfig("DefinitionList", {
    columns: props.columns,
    variant,
  });

  return <SimpleGrid sx={styles.definitionListGrid} {...props} />;
};
