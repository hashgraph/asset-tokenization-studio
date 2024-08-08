import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { progressAnatomy as ChakraProgressAnatomy } from "@chakra-ui/anatomy";
import type { ProgressProps as ChakraProgressProps } from "@chakra-ui/progress";
import { Progress as ChakraProgress } from "@chakra-ui/progress";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import React from "react";

export const progressPartsList: Parts = ["label", "track", "filledTrack"];

type Parts = typeof ChakraProgressAnatomy.keys;

export interface ProgressProps
  extends Omit<ChakraProgressProps, "colorScheme"> {}

type ProgressThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;

export interface ProgressThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (({
        isIndeterminate,
      }: {
        isIndeterminate: boolean;
      }) => Partial<ProgressThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

export const Progress = (props: ProgressProps) => {
  return <ChakraProgress {...props}></ChakraProgress>;
};
