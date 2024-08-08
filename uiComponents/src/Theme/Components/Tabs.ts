import { tabsPartsList } from "@/Components/DataDisplay/Tabs";
import type { TabsThemeConfiguration } from "@/Components/DataDisplay/Tabs";
import { focusVisible } from "@/Theme/utils";
import { textStyles } from "../textStyles";

export const ConfigTabs: TabsThemeConfiguration = {
  parts: tabsPartsList,
  baseStyle: {
    root: {
      position: "relative",
    },
    tablist: {
      "& button[aria-selected=true]": {
        borderColor: "transparent",
      },
    },
    tab: {
      // @ts-ignore
      ...textStyles.ElementsSemiboldLG,
      "--tabs-color": "var(--chakra-colors-neutral-800)",
      height: "56px",
      transition: "all 0.2s",
      _hover: {
        position: "relative",
        bgColor: "neutral.200",
        _before: {
          content: "''",
          position: "absolute",
          left: "0",
          right: "0",
          bottom: "0",
          height: "1px",
          bg: "neutral.400",
        },
        _disabled: {
          bgColor: "transparent",
          _before: {
            content: "none",
          },
        },
      },
      _selected: {
        color: "primary",
        borderColor: "red",
      },
      _focus: {
        ...focusVisible,
        borderRadius: 4,
      },
      _disabled: {
        color: "neutral.400",
        _before: {
          content: "none",
          bg: "transparent",
        },
      },
    },
    indicator: {
      bg: "primary",
      height: "4px",
      mt: "-4px",
    },
    tabpanel: {
      p: 0,
      pt: 4,
    },
  },
  variants: {
    table: {
      tab: {
        _selected: {
          color: "neutral.900",
        },
        _disabled: {
          color: "neutral.400",
        },
      },
      tablist: {
        // @ts-ignore
        ...textStyles.ElementsRegularSM,
        color: "neutral.800",
        bgColor: "neutral.50",
        borderBottom: "1px solid",
        borderColor: "neutral.400",
      },
      indicator: {
        height: "2px",
        mt: "-2px",
      },
    },
  },
};
