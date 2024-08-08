import React from "react";
import { useStyleConfig as useChakraStyleConfig } from "@chakra-ui/system";
import type { FlexProps } from "@chakra-ui/react";
import { Flex as ChakraFlex, Spacer as ChakraSpacer } from "@chakra-ui/react";

export interface SidebarProps extends FlexProps {
  topContent?: React.ReactElement;
  bottomContent?: React.ReactElement;
}
export const Sidebar = ({
  topContent,
  bottomContent,
  ...props
}: SidebarProps) => {
  const styles = useChakraStyleConfig("Sidebar");

  return (
    <ChakraFlex sx={styles} {...props}>
      {topContent || <ChakraSpacer />}
      {bottomContent}
    </ChakraFlex>
  );
};
