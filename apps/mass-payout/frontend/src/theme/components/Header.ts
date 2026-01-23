// SPDX-License-Identifier: Apache-2.0

import { HeaderThemeConfiguration, headerPartsList } from "io-bricks-ui";

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
};
