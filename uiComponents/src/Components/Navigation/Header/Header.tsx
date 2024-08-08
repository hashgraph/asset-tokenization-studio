import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import { Flex as ChakraFlex, Spacer as ChakraSpacer } from "@chakra-ui/react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import { motion } from "framer-motion";

const MotionFlex = motion(ChakraFlex);
export interface HeaderProps extends ChakraFlexProps {
  leftContent?: React.ReactElement;
  rightContent?: React.ReactElement;
  contentContainerProps?: ChakraFlexProps;
}

export const headerPartsList: Array<"container" | "contentContainer"> = [
  "container",
  "contentContainer",
];

type Parts = typeof headerPartsList;

export interface HeaderThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export const Header = ({
  leftContent,
  rightContent,
  contentContainerProps,
  ...props
}: HeaderProps) => {
  const styles = useChakraMultiStyleConfig("Header");

  return (
    <MotionFlex data-testid="header" sx={styles.container} {...props}>
      <ChakraFlex sx={styles.contentContainer} {...contentContainerProps}>
        {leftContent || <ChakraSpacer />}
        {rightContent}
      </ChakraFlex>
    </MotionFlex>
  );
};
