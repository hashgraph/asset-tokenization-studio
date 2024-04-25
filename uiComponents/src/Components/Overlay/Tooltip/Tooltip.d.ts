/// <reference types="react" />
import type { BaseSingleStyleConfiguration } from "@/Theme/Components/BaseSingleStyleConfiguration";
import type { TooltipProps as ChakraTooltipProps } from "@chakra-ui/tooltip";
export interface TooltipThemeConfiguration extends BaseSingleStyleConfiguration {
}
export interface TooltipProps extends ChakraTooltipProps {
}
export declare const Tooltip: ({ label, children, hasArrow, ...props }: TooltipProps) => JSX.Element;
