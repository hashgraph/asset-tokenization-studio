import type { IconButtonProps as ChakraIconButtonProps } from "@chakra-ui/button";
import type { SystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import type { BaseSingleStyleConfiguration } from "@Theme/Components/BaseSingleStyleConfiguration";
import type { ButtonVariantProps } from "../../Interaction/Button";
export type Variant = "primary" | "secondary" | "tertiary" | string;
export interface IconButtonProps extends ChakraIconButtonProps {
    variant?: Variant;
    status?: string;
}
export interface IconButtonThemeConfiguration extends Omit<BaseSingleStyleConfiguration, "variants"> {
    baseStyle: Partial<SystemStyleObject>;
    variants?: {
        [key: string]: ((props: ButtonVariantProps) => Partial<SystemStyleObject>) | Partial<SystemStyleObject>;
    };
}
export declare const IconButton: ComponentWithAs<"button", IconButtonProps>;
