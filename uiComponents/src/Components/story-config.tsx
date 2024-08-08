import type { Meta, StoryFn } from "@storybook/react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { InterFonts } from "./Foundations/Fonts";
import React from "react";
import { BasePlatformTheme } from "@/Theme";

const theme = extendTheme(BasePlatformTheme);

export const ThemeStoryWrapper = ({
  children,
}: {
  children: React.ReactElement | React.ReactElement[];
}) => (
  <ChakraProvider theme={theme}>
    <InterFonts />
    {children}
  </ChakraProvider>
);

export type StoryMetadata<T> = Meta<T> & {
  template: StoryFn<T>;
};
