import type {
  BoxProps as ChakraBoxProps,
  TextProps as ChakraTextProps,
} from "@chakra-ui/layout";
import { Box as ChakraBox } from "@chakra-ui/layout";
import type { ComponentWithAs } from "@chakra-ui/system";
import {
  forwardRef,
  useStyleConfig as useChakraStyleConfig,
} from "@chakra-ui/system";
import React from "react";

export interface TextProps extends ChakraBoxProps {
  size?: ChakraTextProps["size"];
  variant?: ChakraTextProps["variant"];
}

export const Text: ComponentWithAs<"p", TextProps> = forwardRef<TextProps, "p">(
  (
    { children, as = "p", size, variant, textStyle, ...props }: TextProps,
    ref
  ) => {
    const styles = useChakraStyleConfig("Text", { size, variant });

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
