var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { tablePartsList } from "@/Components/DataDisplay/Table";
import { textStyles } from "../textStyles";
var row = {
    bg: "neutral",
    boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.05)",
    borderRadius: "simple"
};
var borderRadiusFirst = {
    borderTopLeftRadius: "simple",
    borderBottomLeftRadius: "simple"
};
var borderRadiusLast = {
    borderTopRightRadius: "simple",
    borderBottomRightRadius: "simple"
};
var disabledColor = "neutral.500";
var enabledColor = "neutral.900";
var baseStyle = function (_a) {
    var isSorted = _a.isSorted, typeOfSort = _a.typeOfSort, isLoading = _a.isLoading;
    return ({
        headerContainer: __assign(__assign({}, row), { mb: 2 }),
        header: {
            apply: "textStyles.ElementsMediumSM",
            color: "neutral.900",
            py: 3,
            px: 4,
            textAlign: "left",
            button: {
                ml: 2
            },
            _first: borderRadiusFirst,
            _last: borderRadiusLast
        },
        headerIcon: {
            py: 3,
            pl: 4,
            pr: 2,
            w: 6,
            maxW: 6,
            _first: borderRadiusFirst,
            _last: borderRadiusLast
        },
        cell: {
            apply: "textStyles.ElementsRegularSM",
            color: "neutral.700",
            px: 4,
            _first: borderRadiusFirst,
            _last: borderRadiusLast,
            _focusVisible: {
                outline: "var(--chakra-colors-primary-100) auto 1px"
            }
        },
        cellIcon: {
            pl: 4,
            pr: 2,
            _first: borderRadiusFirst,
            _last: borderRadiusLast,
            _focusVisible: {
                outline: "var(--chakra-colors-primary-100) auto 1px"
            }
        },
        rowContainer: __assign(__assign({}, row), (!isLoading && {
            _hover: {
                bg: "neutral.200"
            }
        })),
        rowContainerExpanded: __assign(__assign({}, row), { bg: "neutral.100", color: "neutral.700", mt: -2, borderTop: "1px solid", borderColor: "neutral.100", borderBottomRadius: "simple" }),
        tableContainer: {
            borderCollapse: "separate",
            borderSpacing: "0 0.5rem"
        },
        empty: {
            w: "full",
            minH: "full",
            py: 4
        },
        container: {
            overflow: "auto",
            maxH: "624px",
            mt: "-0.5rem",
            mb: "-0.5rem"
        },
        footerText: {
            apply: "textStyles.ElementsRegularXS",
            color: "neutral.900",
            mx: 2
        },
        subtext: {
            apply: "textStyles.ElementsLightXS",
            color: "neutral.400 "
        },
        title: __assign({}, textStyles.ElementsSemiboldLG),
        rowExpander: {
            w: 6,
            maxW: 6,
            bgColor: "transparent",
            border: 0,
            _focus: {
                bgColor: "transparent"
            },
            "& svg": {
                fill: "neutral.800"
            }
        },
        sortIcon: {
            "& path:first-of-type": {
                fill: isSorted
                    ? typeOfSort === "desc"
                        ? enabledColor
                        : disabledColor
                    : "neutral.800"
            },
            "& path:last-of-type": {
                fill: isSorted
                    ? typeOfSort === "asc"
                        ? enabledColor
                        : disabledColor
                    : "neutral.800"
            }
        }
    });
};
export var ConfigTable = {
    parts: tablePartsList,
    baseStyle: baseStyle,
    sizes: {
        sm: {
            header: {
                py: 3
            },
            cell: {
                h: 11
            }
        },
        lg: {
            header: {
                py: "14px"
            },
            cell: {
                h: 12
            }
        }
    },
    defaultProps: {
        size: "lg"
    }
};
