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
import { clipboardButtonPartsList } from "@Components/Interaction/ClipboardButton";
var focusStyle = {
    boxShadow: "none",
    bg: "transparent",
    _before: {
        borderWidth: 0
    }
};
export var ClipboardButtonTheme = {
    parts: clipboardButtonPartsList,
    baseStyle: {
        iconButton: {
            ml: 2,
            p: 0,
            _hover: {
                bg: "transparent"
            },
            _focus: __assign({}, focusStyle),
            _focusVisible: __assign({}, focusStyle)
        }
    }
};
