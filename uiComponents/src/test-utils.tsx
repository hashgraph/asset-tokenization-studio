import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { RenderResult } from "@testing-library/react";
import { render as testingLibraryRender } from "@testing-library/react";
import React from "react";
import { BasePlatformTheme } from "./Theme/theme";

const DefaultTheme = extendTheme(BasePlatformTheme);

export const render = (ui: JSX.Element, theme = DefaultTheme): RenderResult => {
  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <ChakraProvider theme={theme}>{children}</ChakraProvider>
  );

  return testingLibraryRender(ui, { wrapper });
};
