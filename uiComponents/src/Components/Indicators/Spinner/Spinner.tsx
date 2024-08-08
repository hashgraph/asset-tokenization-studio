import React from "react";
import type { SpinnerProps as ChakraSpinnerProps } from "@chakra-ui/react";
import { Spinner as ChakraSpinner } from "@chakra-ui/react";

export interface SpinnerProps extends ChakraSpinnerProps {}

export const Spinner = (props: SpinnerProps) => {
  return <ChakraSpinner data-testid="spinner" {...props} />;
};
