import { Heading } from "@/Components/Foundations/Heading";
import type { FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import { Flex as ChakraFlex } from "@chakra-ui/react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import React from "react";

export interface TableTitleProps extends ChakraFlexProps {
  actions?: React.ReactElement;
  variant?: string;
  children: React.ReactElement | string;
}
export const TableTitle = ({
  children,
  variant,
  actions,
  ...props
}: TableTitleProps) => {
  const { title: styles } = useChakraMultiStyleConfig("Table", {
    variant,
  });

  return (
    <ChakraFlex gap={2} mb={4} {...props}>
      <Heading sx={styles}>{children}</Heading>
      {actions}
    </ChakraFlex>
  );
};
