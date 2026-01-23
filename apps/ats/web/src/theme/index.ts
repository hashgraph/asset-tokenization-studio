// SPDX-License-Identifier: Apache-2.0

import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import _omit from "lodash/omit";
import { fonts, fontWeights } from "./fonts";
import { BasePlatformTheme } from "io-bricks-ui/Theme";
import { components } from "./components";
import { colors } from "./colors";

const config: ThemeConfig = {
  initialColorMode: "dark",
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
  colors,
  config,
  components,
  fonts,
  fontWeights,
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
        height: "100vh",
        fontFamily: "inter",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        background: "neutral.white",
        display: "flex",
        color: "neutral.800",
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
    },
  },
  layerStyles: {
    container: {
      ...commonContainerLayout,
      bgColor: "neutral.50",
    },
    greyContainer: {
      ...commonContainerLayout,
      bgColor: "neutral.100",
    },
    whiteContainer: {
      ...commonContainerLayout,
      bgColor: "neutral.white",
    },
  },
});

export default theme;
