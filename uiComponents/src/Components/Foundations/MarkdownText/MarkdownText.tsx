import type { BoxProps } from "@chakra-ui/layout";
import type { ComponentWithAs } from "@chakra-ui/system";
import { Box } from "@chakra-ui/layout";
import { forwardRef } from "@chakra-ui/system";
import React from "react";
import ReactMarkdown from "react-markdown";
import type { TransformLinkTarget } from "react-markdown/src/ast-to-react";
import type { Defaults } from "./ChakraUIMarkdownRenderer";
import { ChakraUIMarkdownRenderer } from "./ChakraUIMarkdownRenderer";

export interface MarkdownTextProps {
  children: string;
  styles?: BoxProps;
  sx?: BoxProps["sx"];
  linkTarget?: TransformLinkTarget | React.HTMLAttributeAnchorTarget;
  theme?: Defaults;
}

export const MarkdownText: ComponentWithAs<"div", MarkdownTextProps> =
  forwardRef<MarkdownTextProps, "div">(
    ({ styles, children, sx, linkTarget, theme }: MarkdownTextProps, ref) => {
      return (
        <Box ref={ref} {...styles} sx={sx}>
          <ReactMarkdown
            linkTarget={linkTarget}
            components={ChakraUIMarkdownRenderer(theme)}
          >
            {children}
          </ReactMarkdown>
        </Box>
      );
    }
  );
