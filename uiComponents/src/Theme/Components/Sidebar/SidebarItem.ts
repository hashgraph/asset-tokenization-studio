import { Weight } from "@/Components/Foundations/PhosphorIcon";
import { focusVisible } from "@/Theme/utils";
import type { SidebarItemThemeConfiguration } from "@Components/Navigation/Sidebar";
import { sidebarPartsList } from "@Components/Navigation/Sidebar";

const iconActiveStyle = {
  bg: "primary.100",
  color: "neutral.900",
};
const iconHoverStyle = {
  bg: "neutral.200",
};
const iconDisabledStyle = {
  color: "neutral.200",
};

const labelActiveStyle = {
  textStyle: "ElementsSemiboldXS",
  color: "neutral.900",
};

const labelDisabledStyle = {
  color: "neutral.200",
};

export const ConfigSidebarItem: SidebarItemThemeConfiguration = {
  parts: sidebarPartsList,
  baseStyle: ({ isHovered, isActive, isDisabled }) => {
    const isItemActive = isActive && !isDisabled;

    return {
      iconWeight: isActive && !isDisabled ? Weight.Fill : Weight.Regular,
      icon: {
        _focusVisible: focusVisible,
        borderColor: "red",
        color: "neutral.800",
        p: 1,
        borderRadius: "8px",
        transition: "all .3s ease",
        svg: {
          color: "inherit",
        },
        ...(isHovered && iconHoverStyle),
        ...(isItemActive && iconActiveStyle),
        ...(isDisabled && iconDisabledStyle),
      },
      label: {
        transition: "all .3s ease",
        color: "neutral.800",
        textStyle: "ElementsMediumXS",
        mt: 1,
        px: 1,
        ...(isItemActive && labelActiveStyle),
        ...(isDisabled && labelDisabledStyle),
      },
      container: {
        cursor: isDisabled ? "not-allowed" : "pointer",
        px: 2,
      },
    };
  },
};
