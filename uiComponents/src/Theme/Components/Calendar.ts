import type {
  CalendarConfigProps,
  CalendarThemeConfiguration,
} from "@Components/DataDisplay/Calendar";
import { calendarPartsList } from "@Components/DataDisplay/Calendar";
import { textStyles } from "../textStyles";

const neutralColor = "neutral";

export const ConfigCalendar: CalendarThemeConfiguration = {
  parts: calendarPartsList,
  baseStyle: ({
    colorScheme,
    isSelected,
    isDayHidden,
    isToday,
  }: CalendarConfigProps) => ({
    container: {
      bgColor: "neutral",
      maxWidth: "296px",
      boxShadow: "0px 1px 5px 1px rgba(50, 50, 50, 0.2)",
      borderRadius: 8,
      ":root": {
        "--rdp-accent-color": `
        var(
          --chakra-colors-${colorScheme}-500
          )`,
        "--rdp-background-color": `
        var(
          --chakra-colors-${colorScheme}-50
          )`,
      },
      "&.rdp": {
        margin: 0,
      },
      "& .rdp-month": {
        width: "100%",
      },
      "& .rdp-table": {
        my: 4,
        mx: "auto",
      },
      "& .rdp-head": {
        color: `${neutralColor}.800`,
      },
      "& .rdp-head_cell": {
        textTransform: "capitalize",
      },
    },
    footer: {
      apply: "textStyles.ElementsRegularSM",
      mt: 4,
      textAlign: "center",
      alignItems: "center",
      color: `var(--chakra-colors-${neutralColor}-600)`,
    },
    input: {
      border: `1px solid  var(--chakra-colors-${neutralColor}-300) !important`,
      borderColor: `${neutralColor}.300`,
    },
    timeInput: {
      paddingInlineStart: 8,
      paddingY: 0,
      w: "111px",
      mr: 4,
      "&::-webkit-calendar-picker-indicator": {
        // Move the calendar icon to the left
        background: "none",
        display: "none",
      },
    },
    dropdownPanel: {
      shadow: "md",
      color: `${neutralColor}.800`,
      p: 4,
      minW: "50px",
      maxHeight: "280px",
      overflowY: "auto",
    },
    changeMonthButton: {
      color: "neutral",
      bgColor: "transparent",
      _hover: {
        bgColor: "transparent",
      },
      _active: {
        bgColor: "transparent",
      },
      _focus: {
        bgColor: "transparent",
      },
      _disabled: {
        bgColor: "transparent",
        cursor: "not-allowed",
      },
    },
    header: {
      width: "100%",
      height: "48px",
      bgColor: `${colorScheme}.500`,
      justifyContent: "space-around",
      alignItems: "center",
      borderTopRadius: 8,
      apply: "textStyles.ElementsBoldXS",
    },
    dropdownButton: {
      minWidth: "200px",
      bgColor: "transparent",
      _hover: {
        bgColor: "transparent",
      },
      _active: {
        bgColor: "transparent",
      },
      _focus: {
        bgColor: "transparent",
      },
    },
    headerTitle: {
      apply: "textStyles.ElementsBoldXS",
      color: "neutral",
      textAlign: "center",
    },
    yearTitle: {
      apply: "textStyles.ElementsBoldXS",
      color: "inherit",
      textAlign: "center",
    },
    month: {
      apply: "textStyles.ElementsRegularXS",
      borderRadius: "md",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      bgColor: isSelected ? `${colorScheme}.500` : "neutral",
      color: isSelected ? "neutral" : `inherit`,
      _hover: {
        bgColor: isSelected ? `${colorScheme}.500` : `${neutralColor}.50`,
      },
      _disabled: {
        bgColor: "neutral",
        color: `${neutralColor}.200`,
        cursor: "not-allowed",
      },
    },
    day: {
      minWidth: "unset",
      minHeight: "unset",
      maxWidth: 6,
      maxHeight: 6,
      padding: 2,
      borderRadius: 4,
      // @ts-ignore
      ...textStyles.ElementsRegularXS,
      ...(isToday && {
        borderWidth: 1,
        borderColor: `${colorScheme}.500`,
      }),
      display: isDayHidden ? "none" : "flex",
      bgColor: isSelected ? `${colorScheme}.500` : "neutral",
      color: isSelected ? "neutral" : `${neutralColor}.800`,
      _hover: {
        bgColor: isSelected ? `${colorScheme}.500` : `${neutralColor}.50`,
        color: isSelected ? "neutral" : `${neutralColor}.800`,
      },
      _disabled: {
        bgColor: "neutral",
        color: `${neutralColor}.200`,
        cursor: "not-allowed",
        "&.rdp-day_today": {
          borderColor: `${colorScheme}.200 !important`,
        },
        _hover: {
          bgColor: "neutral",
          color: `${neutralColor}.200`,
          "&.rdp-day_today": {
            borderColor: `${colorScheme}.200 !important`,
          },
        },
      },
    },
  }),
  defaultProps: {
    colorScheme: "primary",
  },
};
