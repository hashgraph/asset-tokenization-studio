import type { BreadcrumbThemeConfiguration } from "@iob/io-bricks-ui/Navigation";
import { breadcrumbPartsList } from "@iob/io-bricks-ui/Navigation";

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
