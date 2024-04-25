import type { BoxProps as ChakraBoxProps, HeadingProps as ChakraHeadingProps } from "@chakra-ui/layout";
import type { ComponentWithAs } from "@chakra-ui/system";
export interface HeadingProps extends ChakraBoxProps {
    size?: ChakraHeadingProps["size"];
    variant?: ChakraHeadingProps["variant"];
}
export declare const Heading: ComponentWithAs<"h2", HeadingProps>;
