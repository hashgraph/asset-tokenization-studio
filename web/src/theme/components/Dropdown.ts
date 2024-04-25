import {
  DropdownThemeConfiguration,
  dropdownPartsList,
} from "@hashgraph/securitytoken-uicomponents/DataDisplay";

export const Dropdown: DropdownThemeConfiguration = {
  parts: dropdownPartsList,
  baseStyle: ({ isActive }) => ({
    wrapper: {
      bg: "neutral.50",
    },
    itemContainer: {
      textStyle: "ElementsMediumSM",
      bg: isActive ? "primary.100" : "transparent",
      color: isActive ? "neutral.700" : "neutral.700",
      _hover: {
        bg: isActive ? "primary.100" : "neutral.100",
        _disabled: {
          bg: "transparent",
        },
      },
      _disabled: {
        color: "neutral.600",
        cursor: "not-allowed",
      },
    },
  }),
};
