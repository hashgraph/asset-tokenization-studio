import type { sliderAnatomy as ChakraSliderParts } from "@chakra-ui/anatomy";
import {
  Slider as ChakraSlider,
  SliderFilledTrack as ChakraSliderFilledTrack,
  SliderThumb as ChakraSliderThumb,
  SliderTrack as ChakraSliderTrack,
  type SliderProps as ChakraSliderProps,
} from "@chakra-ui/slider";
import type { ComponentWithAs } from "@chakra-ui/system";
import { forwardRef } from "@chakra-ui/system";
import React from "react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";

export const sliderPartsList: typeof ChakraSliderParts.keys = [
  "container",
  "track",
  "filledTrack",
  "thumb",
];

type Parts = typeof sliderPartsList;
export interface SliderThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export interface SliderProps extends Omit<ChakraSliderProps, "children"> {}

export const Slider: ComponentWithAs<"div", SliderProps> = forwardRef<
  SliderProps,
  "div"
>(({ ...props }: SliderProps, ref) => {
  return (
    <ChakraSlider ref={ref} {...props}>
      <ChakraSliderTrack>
        <ChakraSliderFilledTrack />
      </ChakraSliderTrack>
      <ChakraSliderThumb />
    </ChakraSlider>
  );
});
