import type { BoxProps as ChakraBoxProps, TextProps as ChakraTextProps } from "@chakra-ui/layout";
import type { ComponentWithAs } from "@chakra-ui/system";
export interface TextProps extends ChakraBoxProps {
    size?: ChakraTextProps["size"];
    variant?: ChakraTextProps["variant"];
}
export declare const Text: ComponentWithAs<"p", TextProps>;
