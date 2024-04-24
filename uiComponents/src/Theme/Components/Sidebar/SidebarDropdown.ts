import { Weight } from "@/Components/Foundations/PhosphorIcon";
import { sidebarDropdownPartsList } from "@Components/Navigation/Sidebar";
import type { SidebarDropdownThemeConfiguration } from "@Components/Navigation/Sidebar";
import { focusVisible } from "@/Theme/utils";

export const ConfigSidebarDropdown: SidebarDropdownThemeConfiguration = {
  parts: sidebarDropdownPartsList,
  baseStyle: ({ isDisabled, isActive, hasHeader }) => {
    return {
      wrapper: {
        bg: "neutral",
        pt: 0,
        borderRadius: "8px",
        boxShadow: "0px 0px 5px 0px rgba(50, 50, 50, 0.2)",
        border: 0,
        _before: {
          position: "absolute",
          content: `""`,
          top: 4,
          left: "-13px",
          width: 0,
          height: 0,
          borderTop: "10px solid transparent",
          borderBottom: "10px solid transparent",
          borderRight: "14px solid",
          borderRightColor: hasHeader ? "neutral.100" : "neutral",
          filter: "drop-shadow(-2px 0px 2px rgb(0 0 0 / 11%))",
          zIndex: -1,
        },
      },
      container: {
        p: 4,
      },
      header: {
        py: 2,
        px: 4,
        bg: "neutral.100",
      },
      itemIconWeight: isActive ? Weight.Fill : Weight.Regular,
      itemLabel: {
        textStyle: "ElementsRegularSM",
        color: "neutral.700",
        ml: 2,
        ...(isActive && {
          textStyle: "ElementsMediumSM",
          color: "neutral.800",
        }),
        ...(isDisabled && {
          color: "neutral.200",
        }),
      },
      itemContainer: {
        _focusVisible: focusVisible,
        py: "6px",
        px: 2,
        bg: "neutral",
        borderRadius: "simple",
        color: "neutral.700",
        transition: "all .3s ease",
        svg: {
          color: "inherit",
        },
        _hover: {
          bg: "neutral.100",
        },
        ...(isActive && {
          bg: "primary.50",
          _hover: {
            bg: "primary.50",
          },
        }),

        ...(isDisabled && {
          color: "neutral.200",
          cursor: isDisabled ? "not-allowed" : "pointer",
          _hover: {
            bg: "transparent",
          },
        }),
      },
    };
  },
};
