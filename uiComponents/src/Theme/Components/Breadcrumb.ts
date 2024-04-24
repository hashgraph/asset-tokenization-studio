import type { BreadcrumbThemeConfiguration } from "@/Components/Navigation/Breadcrumb";
import { breadcrumbPartsList } from "@/Components/Navigation/Breadcrumb";
import { focusVisible } from "@/Theme/utils";
// import { commonFocusThemeProps } from "@/Theme/utils";

export const ConfigBreadcrumb: BreadcrumbThemeConfiguration = {
  parts: breadcrumbPartsList,
  baseStyle: {
    isDesktop: {
      base: false,
      md: true,
    },
    container: {
      color: "neutral.500",
      maxW: { base: "full" },
      textStyle: "ElementsSemiboldSM",
    },
    link: {
      _focusVisible: {
        ...focusVisible,
        borderRadius: "simple",
      },
    },
    item: {
      "span[role='presentation']": {
        marginInlineStart: "4px",
      },
      _last: {
        span: {
          color: "neutral.700",
          cursor: "default",
          textDecoration: "none",
          textStyle: "ElementsBoldSM",
        },
      },
      a: {
        _hover: {
          color: "primary.500",
          textDecoration: "none",
        },
        _focus: {
          color: "primary.500",
          textDecoration: "underline",
        },
      },
      svg: {
        color: "neutral.700",
      },
    },
    menu: {
      span: {
        alignSelf: "center",
        display: "flex",
        svg: {
          color: "black",
        },
      },
      _expanded: {
        span: {
          svg: {
            bg: "neutral.300",
            borderRadius: "8px",
          },
        },
      },
    },
    separator: {
      display: "flex",
      alignItems: "center",
    },
  },
  defaultProps: {},
};
