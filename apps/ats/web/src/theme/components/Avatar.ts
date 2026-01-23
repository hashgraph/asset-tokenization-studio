// SPDX-License-Identifier: Apache-2.0

import { AvatarThemeConfiguration, avatarPartsList } from "io-bricks-ui";

export const Avatar: AvatarThemeConfiguration = {
  parts: avatarPartsList,
  baseStyle: () => ({
    container: {
      bg: "neutral.100",
      fontWeight: "medium",
      justifyContent: "center",
      alignContent: "center",
      svg: {
        color: "neutral.white",
        w: 6,
        h: 6,
      },
    },
  }),
  sizes: {
    md: () => ({
      container: {
        w: 8,
        h: 8,
      },
    }),
  },
  variants: {
    light: () => ({
      container: {
        color: "black",
      },
    }),
  },

  defaultProps: {
    size: "md",
  },
};
