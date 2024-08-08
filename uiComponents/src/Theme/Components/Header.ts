import type { HeaderThemeConfiguration } from "@Components/Navigation/Header";

export const ConfigHeader: HeaderThemeConfiguration = {
  parts: ["container", "contentContainer"],
  baseStyle: {
    container: {
      bg: "neutral.50",
      height: "64px",
      pl: 6,
      pr: 8,
      py: 4,
    },
    contentContainer: {
      maxW: "1400px",
      justifyContent: "space-between",
      margin: "auto",
      w: "full",
    },
  },
};
