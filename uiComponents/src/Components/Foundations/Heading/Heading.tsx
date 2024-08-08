import type {
  BoxProps as ChakraBoxProps,
  HeadingProps as ChakraHeadingProps,
} from "@chakra-ui/layout";
import { Box as ChakraBox } from "@chakra-ui/layout";
import type { ComponentWithAs } from "@chakra-ui/system";
import {
  forwardRef,
  useStyleConfig as useChakraStyleConfig,
} from "@chakra-ui/system";
import React from "react";

export interface HeadingProps extends ChakraBoxProps {
  size?: ChakraHeadingProps["size"];
  variant?: ChakraHeadingProps["variant"];
}

export const Heading: ComponentWithAs<"h2", HeadingProps> = forwardRef<
  HeadingProps,
  "h2"
>(
  (
    { children, as = "h2", size, variant, textStyle, ...props }: HeadingProps,
    ref
  ) => {
    const styles = useChakraStyleConfig("Heading", { size, variant });

    return (
      <ChakraBox
        ref={ref}
        as={as}
        textStyle={textStyle}
        {...props}
        {...(!textStyle && { __css: styles })}
      >
        {children}
      </ChakraBox>
    );
  }
);
