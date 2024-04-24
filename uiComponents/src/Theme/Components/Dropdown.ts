import { Weight } from "@/Components/Foundations/PhosphorIcon";
import { focusVisible } from "@/Theme/utils";
import type { DropdownThemeConfiguration } from "@Components/DataDisplay/Dropdown";

export const ConfigDropdown: DropdownThemeConfiguration = {
  parts: [
    "wrapper",
    "container",
    "itemContainer",
    "itemIconWeight",
    "itemLabel",
  ],
  baseStyle: ({ isDisabled, isActive, hasMaxHeight, hasMaxWidth }) => ({
    wrapper: {
      bg: "neutral",
      pt: 0,
      pb: 0,
      borderRadius: "8px",
      boxShadow: "0px 0px 5px 0px rgba(50, 50, 50, 0.2)",
      ...(hasMaxWidth && { maxW: "300px", overflowX: "hidden" }),
      minW: "45px",
      border: 0,
    },
    container: {
      p: 2,
      ...(hasMaxHeight && { maxH: "264px", overflow: "auto" }),
    },
    itemLabel: {
      textStyle: "ElementsMediumSM",
      color: "neutral.700",
      ...(isDisabled && {
        color: "neutral.200",
      }),
    },
    itemIconWeight: isActive ? Weight.Fill : Weight.Regular,
    itemContainer: {
      _focusVisible: {
        ...focusVisible,
        borderRadius: "simple",
      },
      py: "2px",
      px: 2,
      bg: "neutral",
      borderRadius: "simple",
      color: "neutral.700",
      transition: "all .3s ease",
      gap: 2,
      _focus: {
        textDecor: "none !important",
      },
      svg: {
        color: "inherit",
        transition: "all .3s ease",
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
        bg: "transparent",
        cursor: isDisabled ? "not-allowed" : "pointer",
        _hover: {
          bg: "transparent",
        },
      }),
    },
  }),
};
