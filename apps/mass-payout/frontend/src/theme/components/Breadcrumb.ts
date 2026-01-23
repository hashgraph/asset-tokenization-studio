// SPDX-License-Identifier: Apache-2.0

import type { BreadcrumbThemeConfiguration } from "io-bricks-ui";
import { breadcrumbPartsList } from "io-bricks-ui";

export const Breadcrumb: BreadcrumbThemeConfiguration = {
  parts: breadcrumbPartsList,
  baseStyle: {
    item: {
      textStyle: "ElementsSemiboldSM",
      _last: {
        span: {
          color: "neutral.700",
          cursor: "default",
          textDecoration: "none",
          textStyle: "ElementSMBold",
        },
      },
      svg: {
        color: "neutral.500",
      },
    },
    isDesktop: {
      base: true,
      md: true,
    },
    link: {
      textStyle: "ElementsSemiboldSM",
      color: "neutral.500",

      "&:last-child": {
        textStyle: "ElementsBoldSM",
      },
    },
  },
};
