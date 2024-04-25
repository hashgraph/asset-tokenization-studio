import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/button";
import type { ComponentWithAs } from "@chakra-ui/system";
import type { BaseSingleStyleConfiguration } from "@Theme/Components/BaseSingleStyleConfiguration";
export interface AddAreaButtonProps extends ChakraButtonProps {
}
export interface AddAreaButtonThemeConfiguration extends BaseSingleStyleConfiguration {
}
export declare const AddAreaButton: ComponentWithAs<"button", AddAreaButtonProps>;
