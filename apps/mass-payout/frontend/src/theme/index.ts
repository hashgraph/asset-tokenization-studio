// SPDX-License-Identifier: Apache-2.0

import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import _omit from "lodash/omit";
import { BasePlatformTheme } from "io-bricks-ui/Theme";
import { colors } from "./colors";
import { components } from "./components";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};
const iobricksTheme = _omit(BasePlatformTheme, "colors");
const commonContainerLayout = {
  w: "full",
  p: 4,
  pt: 6,
  borderRadius: 1,
  "&::-webkit-scrollbar": {
    w: 2,
    h: "213px",
  },
  "&::-webkit-scrollbar-track": {
    w: 2,
    h: "213px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "primary.100",
    borderRadius: "20px",
  },
};
const theme = extendTheme(iobricksTheme, {
  breakpoints: {
    sm: "20em",
    md: "48em",
    lg: "60em",
    xl: "75em",
  },
  config,
  colors,
  components,
  radii: {
    2: "8px",
    normal: "5px",
  },
  styles: {
    global: {
      "*": {
        fontWeight: "unset",
      },
      body: {
        margin: 0,
        padding: 0,
        bg: "white",
        color: "black",
        height: "100vh",
        fontFamily: "inter",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        display: "flex",
        "::-webkit-scrollbar": {
          width: "12px",
        },
        "::-webkit-scrollbar-track": {
          backgroundColor: "gray.100",
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, .3)",
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: "gray.400",
          borderRadius: "8px",
        },
      },
      "#root": {
        display: "flex",
        width: "100%",
        maxWidth: "auto",
        p: 0,
        main: {
          flex: 1,
          overflow: "auto",
          marginTop: 0,
        },
      },
      //For chakra calendar
      ".chakra-button[data-testid*='day-']": {
        border: "none ",
        outline: "none ",
        boxShadow: "none ",
      },
    },
  },
  layerStyles: {
    container: {
      ...commonContainerLayout,
      bgColor: "white",
    },
    lightContainer: {
      flex: 1,
      bg: "neutral.50",
      borderRadius: "lg",
      boxShadow: "sm",
      pt: 4,
      px: 6,
      pb: 6,
    },
  },
});

export default theme;
