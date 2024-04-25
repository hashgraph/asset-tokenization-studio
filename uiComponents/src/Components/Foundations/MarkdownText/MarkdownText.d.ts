import type { BoxProps } from "@chakra-ui/layout";
import type { ComponentWithAs } from "@chakra-ui/system";
import React from "react";
import type { TransformLinkTarget } from "react-markdown/src/ast-to-react";
import type { Defaults } from "./ChakraUIMarkdownRenderer";
export interface MarkdownTextProps {
    children: string;
    styles?: BoxProps;
    sx?: BoxProps["sx"];
    linkTarget?: TransformLinkTarget | React.HTMLAttributeAnchorTarget;
    theme?: Defaults;
}
export declare const MarkdownText: ComponentWithAs<"div", MarkdownTextProps>;
