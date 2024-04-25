import type { RadioGroupProps as ChakraRadioGroupProps } from "@chakra-ui/radio";
import type { ComponentWithAs } from "@chakra-ui/system";
import type { BaseSingleStyleConfiguration } from "@Theme/Components/BaseSingleStyleConfiguration";
export interface RadioGroupThemeConfiguration extends BaseSingleStyleConfiguration {
}
export interface RadioGroupProps extends ChakraRadioGroupProps {
}
export declare const RadioGroup: ComponentWithAs<"div", RadioGroupProps>;
