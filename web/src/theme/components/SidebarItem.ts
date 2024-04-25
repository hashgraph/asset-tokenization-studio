import {
  SidebarItemConfigProps,
  SidebarItemThemeConfiguration,
  sidebarPartsList,
} from "@hashgraph/uiComponents/Navigation";

const iconStyles = {
  hover: {
    bgColor: "neutral.150",
  },

  selected: {
    bgColor: "neutral.100",
    color: "neutral.650",
  },

  disabled: {
    color: "neutral.600",
  },
};

const labelStyles = {
  selected: {
    textStyle: "ElementsSemiboldXS",
  },

  disabled: {
    color: "neutral.600",
  },
};

export const SidebarItem: SidebarItemThemeConfiguration = {
  parts: sidebarPartsList,
  baseStyle: ({ isHovered, isActive, isDisabled }: SidebarItemConfigProps) => {
    const isSelected = isActive && !isDisabled;

    return {
      icon: {
        color: "neutral.800",
        ...(isSelected && iconStyles.selected),
        ...(isHovered && !isSelected && iconStyles.hover),
        ...(isDisabled && iconStyles.disabled),
      },

      label: {
        textStyle: "ElementsMediumXS",
        color: "neutral.800",
        ...(isSelected && labelStyles.selected),
        ...(isDisabled && labelStyles.disabled),
      },
    };
  },
};
