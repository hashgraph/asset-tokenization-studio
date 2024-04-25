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
var focusStyle = {
    bgColor: "transparent",
    _before: {
        content: "\"\"",
        position: "absolute",
        w: "-webkit-fill-available",
        h: "90%",
        borderWidth: "3px",
        borderColor: "primary.100",
        borderStyle: "solid",
        borderRadius: "5px",
        filter: "blur(0.5px)"
    }
};
export var ConfigLink = {
    baseStyle: {
        display: "block",
        w: "fit-content",
        textDecoration: "underline",
        position: "relative",
        textStyle: "BodyRegularSM",
        p: {
            px: 1
        }
    },
    variants: {
        table: {
            color: "neutral.900",
            _focusVisible: focusStyle,
            _focus: {
                boxShadow: "none"
            }
        },
        highlighted: function (_a) {
            var isDisabled = _a.isDisabled;
            return (__assign({ color: "primary.500", _hover: {
                    color: "primary.700"
                }, _pressed: {
                    color: "red"
                }, _focus: __assign(__assign({}, focusStyle), { color: "primary.700" }), _focusVisible: {
                    boxShadow: "none"
                } }, (isDisabled && {
                color: "primary.100",
                cursor: "not-allowed",
                _hover: {},
                _focus: {}
            })));
        }
    },
    defaultProps: {
        variant: "highlighted"
    }
};
