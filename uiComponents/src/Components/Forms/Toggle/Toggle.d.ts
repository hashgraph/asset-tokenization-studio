import type { switchAnatomy as ChakraSwitchParts } from "@chakra-ui/anatomy";
import type { SwitchProps as ChakraSwitchProps } from "@chakra-ui/switch";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { ComponentWithAs } from "@chakra-ui/system";
export declare const togglePartsList: Array<(typeof ChakraSwitchParts.keys)[number] | "label">;
type Parts = typeof togglePartsList;
export interface ToggleThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface ToggleProps extends Omit<ChakraSwitchProps, "placeholder"> {
    label?: string;
}
export declare const Toggle: ComponentWithAs<"input", ToggleProps>;
export {};
