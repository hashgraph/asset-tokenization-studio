import {
  CalendarConfigProps,
  CalendarThemeConfiguration,
  calendarPartsList,
} from "@hashgraph/securitytoken-uicomponents/DataDisplay";

export const Calendar: CalendarThemeConfiguration = {
  parts: calendarPartsList,
  baseStyle: ({ isSelected }: CalendarConfigProps) => ({
    container: {
      "&": {
        "--popper-bg": "var(--chakra-colors-neutral-300)",
      },
      "& .rdp-table": {
        bg: "neutral.white",
      },
      bg: "neutral.white",
      borderRadius: "simple",
    },

    footer: {
      color: "neutral.400",
    },
    dropDownPannel: {
      bgColor: "neutral.white",
    },
    changeMonthButton: {
      color: "neutral.white",
      bg: "transparent",
      borderWidth: 0,
    },
    input: {
      border: "1px",
      borderColor: "neutral.300",
      minH: 10,
    },
    header: {
      bgColor: "primary.500",
      apply: "textStyles.ElementsBoldXS",
    },
    dropdownButton: {
      borderWidth: 0,
      color: "neutral.white",
      _hover: {
        color: "neutral.white",
      },
      _focus: {
        color: "neutral.white",
      },
    },
    headerTitle: {
      textStyle: "ElementsBoldXS",
      color: "neutral.white",
    },
    yearTitle: {
      apply: "textStyles.ElementsBoldXS",
      color: "inherit",
      textAlign: "center",
    },
    month: {
      apply: "textStyles.ElementsRegularXS",
      bgColor: isSelected ? "primary.50" : "neutral.white",
      color: isSelected ? "neutral.700" : "inherit",
      _hover: {
        bgColor: isSelected ? "primary.50" : "primary.50",
      },
      _disabled: {
        bgColor: "neutral.white",
        color: "neutral.200",
        cursor: "not-allowed",
      },
    },
    day: {
      minW: 6,
      minH: 6,
      p: 0,
      borderColor: isSelected ? "primary.500" : "neutral.white",
      "&.rdp-day_today": {
        borderWidth: "1px !important",
        borderColor: "primary.500",
        fontWeight: "normal !important",
      },
      bgColor: isSelected ? "primary.500" : "neutral.white",
      color: isSelected ? "neutral.white" : "neutral.800",
      _hover: {
        bgColor: isSelected ? "neutral.white" : "neutral.white",
        color: isSelected ? "primary.500" : "neutral.800",
      },

      _disabled: {
        bgColor: "neutral.white",
        color: "neutral.200",
        cursor: "not-allowed",
        "&.rdp-day_today": {
          borderColor: "primary.200 !important",
        },
        _hover: {
          bgColor: "neutral.white",
          color: "primary.200",
          "&.rdp-day_today": {
            borderColor: "primary.200 !important",
          },
        },
      },
    },
  }),
  defaultProps: {},
};
