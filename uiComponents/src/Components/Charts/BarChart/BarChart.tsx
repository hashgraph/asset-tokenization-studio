import {
  Stack as ChakraStack,
  type StackProps as ChakraStackProps,
} from "@chakra-ui/layout";
import {
  Progress as ChakraProgress,
  type ProgressProps as ChakraProgressProps,
} from "@chakra-ui/progress";
import type { ComponentWithAs } from "@chakra-ui/system";
import { Skeleton as ChakraSkeleton } from "@chakra-ui/react";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import React from "react";

import { type progressAnatomy as ChakraProgressParts } from "@chakra-ui/anatomy";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";

export const barChartPartsList: typeof ChakraProgressParts.keys = [
  "label",
  "track",
  "filledTrack",
];

type Parts = typeof barChartPartsList;

export interface BarChartThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export interface BarChartProps {
  data: ChakraProgressProps[];
  spacingBars?: ChakraStackProps["spacing"];
  isLoading?: boolean;
  loadingColumnsCount?: number;
}

export const BarChart: ComponentWithAs<"div", BarChartProps> = forwardRef<
  BarChartProps,
  "div"
>(
  (
    {
      data,
      spacingBars = "4",
      isLoading,
      loadingColumnsCount = 3,
    }: BarChartProps,
    ref
  ) => {
    const styles = useChakraMultiStyleConfig("BarChart");
    return (
      <ChakraStack ref={ref} sx={styles.container} spacing={spacingBars}>
        {isLoading
          ? Array.from({ length: loadingColumnsCount }).map((_, index) => (
              <ChakraSkeleton
                key={index}
                width={`${((index + 1) / loadingColumnsCount) * 100}%`}
                h={3}
              />
            ))
          : data.map((itemProps, index) => (
              <ChakraProgress key={index} {...itemProps} sx={styles.progress} />
            ))}
      </ChakraStack>
    );
  }
);
