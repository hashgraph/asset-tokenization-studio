import type { TableThemeConfiguration } from "@/Components/DataDisplay/Table";
import { tablePartsList } from "@/Components/DataDisplay/Table";
import { textStyles } from "../textStyles";

const row = {
  bg: "neutral",
  boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.05)",
  borderRadius: "simple",
};

const borderRadiusFirst = {
  borderTopLeftRadius: "simple",
  borderBottomLeftRadius: "simple",
};
const borderRadiusLast = {
  borderTopRightRadius: "simple",
  borderBottomRightRadius: "simple",
};
const disabledColor = "neutral.500";
const enabledColor = "neutral.900";

const baseStyle: TableThemeConfiguration["baseStyle"] = ({
  isSorted,
  typeOfSort,
  isLoading,
}) => ({
  headerContainer: {
    ...row,
    mb: 2,
  },
  header: {
    apply: "textStyles.ElementsMediumSM",
    color: "neutral.900",
    py: 3,
    px: 4,
    textAlign: "left",
    button: {
      ml: 2,
    },
    _first: borderRadiusFirst,
    _last: borderRadiusLast,
  },
  headerIcon: {
    py: 3,
    pl: 4,
    pr: 2,
    w: 6,
    maxW: 6,
    _first: borderRadiusFirst,
    _last: borderRadiusLast,
  },
  cell: {
    apply: "textStyles.ElementsRegularSM",
    color: "neutral.700",
    px: 4,
    _first: borderRadiusFirst,
    _last: borderRadiusLast,
    _focusVisible: {
      outline: "var(--chakra-colors-primary-100) auto 1px",
    },
  },
  cellIcon: {
    pl: 4,
    pr: 2,
    _first: borderRadiusFirst,
    _last: borderRadiusLast,
    _focusVisible: {
      outline: "var(--chakra-colors-primary-100) auto 1px",
    },
  },
  rowContainer: {
    ...row,
    ...(!isLoading && {
      _hover: {
        bg: "neutral.200",
      },
    }),
  },
  rowContainerExpanded: {
    ...row,
    bg: "neutral.100",
    color: "neutral.700",
    mt: -2,
    borderTop: "1px solid",
    borderColor: "neutral.100",
    borderBottomRadius: "simple",
  },
  tableContainer: {
    borderCollapse: "separate",
    borderSpacing: "0 0.5rem",
  },
  empty: {
    w: "full",
    minH: "full",
    py: 4,
  },
  container: {
    overflow: "auto",
    maxH: "624px",
    mt: "-0.5rem",
    mb: "-0.5rem",
  },
  footerText: {
    apply: "textStyles.ElementsRegularXS",
    color: "neutral.900",
    mx: 2,
  },
  subtext: {
    apply: "textStyles.ElementsLightXS",
    color: "neutral.400 ",
  },
  title: {
    // @ts-ignore
    ...textStyles.ElementsSemiboldLG,
  },
  rowExpander: {
    w: 6,
    maxW: 6,
    bgColor: "transparent",
    border: 0,
    _focus: {
      bgColor: "transparent",
    },
    "& svg": {
      fill: "neutral.800",
    },
  },
  sortIcon: {
    "& path:first-of-type": {
      fill: isSorted
        ? typeOfSort === "desc"
          ? enabledColor
          : disabledColor
        : "neutral.800",
    },
    "& path:last-of-type": {
      fill: isSorted
        ? typeOfSort === "asc"
          ? enabledColor
          : disabledColor
        : "neutral.800",
    },
  },
});

export const ConfigTable: TableThemeConfiguration = {
  parts: tablePartsList,
  baseStyle,
  sizes: {
    sm: {
      header: {
        py: 3,
      },
      cell: {
        h: 11,
      },
    },
    lg: {
      header: {
        py: "14px",
      },
      cell: {
        h: 12,
      },
    },
  },
  defaultProps: {
    size: "lg",
  },
};
