import {
  HeaderThemeConfiguration,
  headerPartsList,
} from "@iob/io-bricks-ui/Navigation";

export const Header: HeaderThemeConfiguration = {
  parts: headerPartsList,
  baseStyle: {
    container: {
      bg: "neutral.50",
      h: 16,
      pl: 6,
      pr: 8,
      py: 4,
    },

    contentContainer: {
      maxW: "full",
    },
  },
  variants: {
    admin: {
      container: {
        bg: "adminUI.50",
      },
    },
    general: {
      container: {
        bg: "neutral.50",
      },
    },
    holder: {
      container: {
        bg: "neutral.50", // Maybe holderUI.400?
      },
    },
  },
};
