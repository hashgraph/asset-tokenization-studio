import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/button";
import type { SystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import type { BaseSingleStyleConfiguration } from "@Theme/Components/BaseSingleStyleConfiguration";
export type ButtonVariantProps = {
    status: ButtonProps["colorScheme"];
};
export interface ButtonThemeConfiguration extends Omit<BaseSingleStyleConfiguration, "variants"> {
    baseStyle: Partial<SystemStyleObject>;
    variants?: {
        [key: string]: ((props: ButtonVariantProps) => Partial<SystemStyleObject>) | Partial<SystemStyleObject>;
    };
}
export interface ButtonProps extends ChakraButtonProps {
    status?: string;
}
export declare const Button: ComponentWithAs<"button", ButtonProps>;
