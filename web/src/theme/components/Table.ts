import {
  tablePartsList,
  TableThemeConfiguration,
} from "@hashgraph/securitytoken-uicomponents/DataDisplay";
import { BasePlatformTheme } from "@hashgraph/securitytoken-uicomponents/Theme";

const row = {
  bg: "neutral.400",
  boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.05)",
};

const disabledColor = "grey.500";
const enabledColor = "grey.900";

const baseStyle: TableThemeConfiguration["baseStyle"] = ({
  isSorted,
  typeOfSort,
}) => ({
  headerContainer: {
    ...row,
    bg: "neutral.white",
  },
  header: {
    // @ts-ignore
    ...BasePlatformTheme.textStyles.ElementsMediumSM,
    color: "neutral.900",
  },
  cell: {
    apply: "textStyles.ElementsRegularSM",
    color: "neutral.700",
    _focusVisible: {
      outline: "var(--chakra-colors-primary-100) auto 1px",
    },
    bg: "neutral.white",
  },
  rowContainer: {
    ...row,
    _hover: {
      bg: "neutral.150",
    },
  },
  footerText: {
    apply: "textStyles.ElementsRegularXS",
    color: "neutral.900",
    mx: 2,
  },
  subtext: {
    apply: "textStyles.ElementsLightXS ",
    color: "neutral.500",
  },
  title: {
    ...BasePlatformTheme.textStyles.ElementsSemiboldLG,
  },
  sortIcon: {
    "& polyline:first-of-type, & line:first-of-type": {
      stroke: isSorted
        ? typeOfSort === "desc"
          ? enabledColor
          : disabledColor
        : "grey.800",
    },
    "& polyline:last-of-type, & line:last-of-type": {
      stroke: isSorted
        ? typeOfSort === "asc"
          ? enabledColor
          : disabledColor
        : "grey.800",
    },
  },
});

export const Table: TableThemeConfiguration = {
  parts: tablePartsList,
  baseStyle,
  defaultProps: {
    size: "lg",
  },
};
