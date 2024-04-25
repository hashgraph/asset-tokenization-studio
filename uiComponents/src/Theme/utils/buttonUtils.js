var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
import { keyframes } from "@emotion/react";
import { textStyles } from "../textStyles";
export var fill = keyframes(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\nfrom {\u00A0width: 0; }\nto { width: 100%; }"], ["\nfrom {\u00A0width: 0; }\nto { width: 100%; }"])));
export var fillAnimation = "".concat(fill, " infinite 4s linear");
var spinnerClass = ".chakra-spinner";
export var buttonSizes = {
    sm: {
        height: "unset",
        minH: 8,
        py: "6px",
        px: 4
    },
    md: __assign(__assign({ height: "unset" }, textStyles.ElementsMediumSM), { minH: 10, minW: 19, padding: "0 16px" }),
    lg: __assign(__assign({ height: "unset" }, textStyles.ElementsMediumSM), { minH: 12, minW: 19, padding: "0 16px" })
};
var getColorScheme = function (status) {
    if (status) {
        return status;
    }
    return "primary";
};
var getColorSchemeForTertiary = function (status) {
    if (status) {
        return status;
    }
    return "neutral";
};
var focusStyle = function (status) { return ({
    _before: {
        content: "\"\"",
        position: "absolute",
        w: "full",
        h: "full",
        borderWidth: 4,
        borderColor: "".concat(getColorScheme(status), ".100"),
        borderStyle: "solid",
        borderRadius: 12,
        filter: "blur(0.5px)"
    }
}); };
export var buttonVariants = {
    primary: function (_a) {
        var _b;
        var status = _a.status;
        return {
            bg: getColorScheme(status),
            color: "neutral",
            svg: {
                color: "inherit"
            },
            _hover: {
                bg: "".concat(getColorScheme(status), ".700"),
                _disabled: {
                    cursor: "not-allowed",
                    bg: "".concat(getColorScheme(status), ".50")
                }
            },
            _active: {
                bg: "".concat(getColorScheme(status), ".800")
            },
            _focus: __assign({}, focusStyle(status)),
            _focusVisible: __assign({ boxShadow: "none" }, focusStyle(status)),
            _disabled: {
                bg: "".concat(getColorScheme(status), ".50"),
                color: "neutral",
                _hover: {
                    bg: "".concat(getColorScheme(status), ".50")
                }
            },
            _loading: (_b = {
                    bg: "".concat(getColorScheme(status), ".50"),
                    color: "neutral",
                    _hover: {
                        bg: "".concat(getColorScheme(status), ".50")
                    }
                },
                _b[spinnerClass] = {
                    color: "currentColor"
                },
                _b)
        };
    },
    secondary: function (_a) {
        var _b;
        var status = _a.status;
        return ({
            bg: "transparent",
            color: getColorScheme(status),
            borderColor: getColorScheme(status),
            borderWidth: "1px",
            svg: {
                color: "inherit"
            },
            _hover: {
                borderColor: "".concat(getColorScheme(status), ".700"),
                color: "".concat(getColorScheme(status), ".700"),
                bg: "transparent",
                _disabled: {
                    cursor: "not-allowed",
                    bg: "transparent",
                    borderColor: "".concat(getColorScheme(status), ".50"),
                    color: "".concat(getColorScheme(status), ".50")
                }
            },
            _active: {
                borderColor: "".concat(getColorScheme(status), ".800"),
                color: "".concat(getColorScheme(status), ".800")
            },
            _focus: __assign({ borderColor: "".concat(getColorScheme(status), ".800"), color: "".concat(getColorScheme(status), ".800") }, focusStyle(status)),
            _focusVisible: __assign({ boxShadow: "none" }, focusStyle(status)),
            _disabled: {
                borderColor: "".concat(getColorScheme(status), ".50"),
                color: "".concat(getColorScheme(status), ".50"),
                bg: "transparent"
            },
            _loading: (_b = {
                    borderColor: "".concat(getColorScheme(status), ".50"),
                    color: "".concat(getColorScheme(status), ".50"),
                    bg: "transparent",
                    _hover: {
                        bg: "transparent"
                    }
                },
                _b[spinnerClass] = {
                    color: "currentColor"
                },
                _b)
        });
    },
    tertiary: function (_a) {
        var _b;
        var status = _a.status;
        return ({
            bg: "transparent",
            color: "".concat(getColorSchemeForTertiary(status), ".800"),
            border: "none",
            svg: {
                color: "inherit"
            },
            _hover: {
                color: "".concat(getColorSchemeForTertiary(status), ".800"),
                bg: "neutral.200",
                _disabled: {
                    cursor: "not-allowed",
                    bg: "transparent",
                    color: "".concat(getColorSchemeForTertiary(status), ".400")
                }
            },
            _active: {
                color: "".concat(getColorSchemeForTertiary(status), ".800")
            },
            _focus: __assign({}, focusStyle(status)),
            _focusVisible: __assign({ boxShadow: "none" }, focusStyle(status)),
            _disabled: {
                color: "".concat(getColorSchemeForTertiary(status), ".400"),
                bg: "transparent"
            },
            _loading: (_b = {
                    color: "".concat(getColorSchemeForTertiary(status), ".400"),
                    bg: "transparent",
                    span: {
                        lineHeight: 0
                    },
                    _hover: {
                        bg: "transparent"
                    }
                },
                _b[spinnerClass] = {
                    color: "currentColor"
                },
                _b)
        });
    }
};
var templateObject_1;
