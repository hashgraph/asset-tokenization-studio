import React from "react";
import type { BaseSingleStyleConfiguration } from "@/Theme/Components/BaseSingleStyleConfiguration";
import {
  Flex as ChrakraFlex,
  Tooltip as ChakraTooltip,
} from "@chakra-ui/react";
import type { TooltipProps as ChakraTooltipProps } from "@chakra-ui/tooltip";

export interface TooltipThemeConfiguration
  extends BaseSingleStyleConfiguration {}

export interface TooltipProps extends ChakraTooltipProps {}

export const Tooltip = ({
  label,
  children,
  hasArrow = true,
  ...props
}: TooltipProps) => {
  return (
    <ChakraTooltip
      data-testid="tooltip"
      label={label}
      hasArrow={hasArrow}
      {...props}
    >
      <ChrakraFlex>{children}</ChrakraFlex>
    </ChakraTooltip>
  );
};
