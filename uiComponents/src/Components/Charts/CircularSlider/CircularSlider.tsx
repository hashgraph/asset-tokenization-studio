import type { CircularProgressProps as ChakraCircularProgressProps } from "@chakra-ui/progress";
import { SkeletonCircle as ChakraSkeletonCircle } from "@chakra-ui/react";
import React from "react";

import {
  CircularProgress as ChakraCircularProgress,
  CircularProgressLabel as ChakraCircularProgressLabel,
} from "@chakra-ui/progress";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";

export const circularSliderPartsList: ("label" | "track")[] = [
  "label",
  "track",
];

type Parts = typeof circularSliderPartsList;

export interface CircularSliderThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export interface CircularSliderProps
  extends Omit<ChakraCircularProgressProps, "children"> {
  label?: React.ReactElement | string;
  isLoading?: boolean;
}

export const CircularSlider = ({
  label,
  size,
  isLoading,
  ...props
}: CircularSliderProps) => {
  const styles = useChakraMultiStyleConfig("CircularSlider", { size });

  if (isLoading) {
    return <ChakraSkeletonCircle sx={styles.track} />;
  }

  return (
    <ChakraCircularProgress sx={styles.track} {...props}>
      {label !== undefined && (
        <ChakraCircularProgressLabel sx={styles.label}>
          {label}
        </ChakraCircularProgressLabel>
      )}
    </ChakraCircularProgress>
  );
};
