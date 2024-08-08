import {
  sliderPartsList,
  type SliderThemeConfiguration,
} from "@Components/Forms/Slider";

export const ConfigSlider: SliderThemeConfiguration = {
  parts: sliderPartsList,
  baseStyle: {
    container: {
      bg: "transparent",
    },
    track: {
      bg: "neutral.200",
    },
    filledTrack: {
      bg: "blue.500",
    },
    thumb: {
      bg: "neutral",
      p: "7px",
    },
  },
};
