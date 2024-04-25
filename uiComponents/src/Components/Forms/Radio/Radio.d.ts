import type { radioAnatomy as ChakraRadioParts } from "@chakra-ui/anatomy";
import type { RadioProps as ChakraRadioProps } from "@chakra-ui/radio";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { ComponentWithAs } from "@chakra-ui/system";
export declare const radioPartsList: typeof ChakraRadioParts.keys;
type Parts = typeof radioPartsList;
export interface RadioThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface RadioProps extends Omit<ChakraRadioProps, "colorScheme"> {
    label?: string;
}
export declare const Radio: ComponentWithAs<"input", RadioProps>;
export {};
