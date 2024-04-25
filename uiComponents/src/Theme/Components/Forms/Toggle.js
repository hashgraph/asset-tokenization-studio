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
import { togglePartsList } from "@Components/Forms/Toggle";
import { textStyles } from "@/Theme/textStyles";
// WARNING: This is the Toggle component from uiComponents but it is the Switch component from chakra.
// Must be set to Switch in the `theme.components`.
export var ConfigToggle = {
    parts: togglePartsList,
    baseStyle: {
        label: __assign({ ml: "6px", color: "neutral.700" }, textStyles.ElementsRegularXS)
    },
    sizes: {
        md: {
            thumb: {
                background: "neutral",
                w: 4,
                h: 4,
                _checked: {
                    transform: "translateX(14px)"
                }
            },
            track: {
                background: "neutral.300",
                borderRadius: "10px",
                p: "2px",
                w: "30px",
                h: "16px",
                _focus: {
                    boxShadow: "var(--chakra-colors-neutral-200) 0px 0px 1px 2px"
                },
                _hover: {
                    background: "neutral.500"
                },
                _checked: {
                    background: "primary.500",
                    _hover: {
                        background: "primary.700"
                    },
                    _focus: {
                        boxShadow: "var(--chakra-colors-primary-100) 0px 0px 1px 2px"
                    }
                },
                _disabled: {
                    opacity: 1,
                    background: "neutral.200",
                    _checked: {
                        background: "primary.50",
                        _hover: {
                            background: "primary.50"
                        }
                    }
                },
                _invalid: {
                    outline: "1px solid",
                    outlineColor: "error",
                    outlineOffset: "-1px",
                    _focus: {
                        boxShadow: "var(--chakra-colors-error-100) 0px 0px 1px 2px"
                    }
                }
            }
        }
    },
    defaultProps: {
        size: "md"
    }
};
