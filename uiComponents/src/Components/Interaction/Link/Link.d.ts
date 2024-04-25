import type { BaseSingleStyleConfiguration } from "@/Theme/Components/BaseSingleStyleConfiguration";
import type { LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import type { ComponentWithAs, SystemStyleObject } from "@chakra-ui/system";
export interface LinkProps extends ChakraLinkProps {
    isDisabled?: boolean;
    variant?: ChakraLinkProps["variant"];
}
export interface LinkThemeConfiguration extends BaseSingleStyleConfiguration {
    variants?: {
        [key: string]: ((props: LinkProps) => Partial<SystemStyleObject>) | Partial<SystemStyleObject>;
    };
}
export declare const Link: ComponentWithAs<"a", LinkProps>;
