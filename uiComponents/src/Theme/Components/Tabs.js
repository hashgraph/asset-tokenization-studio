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
import { tabsPartsList } from "@/Components/DataDisplay/Tabs";
import { focusVisible } from "@/Theme/utils";
import { textStyles } from "../textStyles";
export var ConfigTabs = {
    parts: tabsPartsList,
    baseStyle: {
        root: {
            position: "relative"
        },
        tablist: {
            "& button[aria-selected=true]": {
                borderColor: "transparent"
            }
        },
        tab: __assign(__assign({}, textStyles.ElementsSemiboldLG), { "--tabs-color": "var(--chakra-colors-neutral-800)", height: "56px", transition: "all 0.2s", _hover: {
                position: "relative",
                bgColor: "neutral.200",
                _before: {
                    content: "''",
                    position: "absolute",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    height: "1px",
                    bg: "neutral.400"
                },
                _disabled: {
                    bgColor: "transparent",
                    _before: {
                        content: "none"
                    }
                }
            }, _selected: {
                color: "primary",
                borderColor: "red"
            }, _focus: __assign(__assign({}, focusVisible), { borderRadius: 4 }), _disabled: {
                color: "neutral.400",
                _before: {
                    content: "none",
                    bg: "transparent"
                }
            } }),
        indicator: {
            bg: "primary",
            height: "4px",
            mt: "-4px"
        },
        tabpanel: {
            p: 0,
            pt: 4
        }
    },
    variants: {
        table: {
            tab: {
                _selected: {
                    color: "neutral.900"
                },
                _disabled: {
                    color: "neutral.400"
                }
            },
            tablist: __assign(__assign({}, textStyles.ElementsRegularSM), { color: "neutral.800", bgColor: "neutral.50", borderBottom: "1px solid", borderColor: "neutral.400" }),
            indicator: {
                height: "2px",
                mt: "-2px"
            }
        }
    }
};
