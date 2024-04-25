import type { sliderAnatomy as ChakraSliderParts } from "@chakra-ui/anatomy";
import { type SliderProps as ChakraSliderProps } from "@chakra-ui/slider";
import type { ComponentWithAs } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const sliderPartsList: typeof ChakraSliderParts.keys;
type Parts = typeof sliderPartsList;
export interface SliderThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface SliderProps extends Omit<ChakraSliderProps, "children"> {
}
export declare const Slider: ComponentWithAs<"div", SliderProps>;
export {};
