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
import { textStyles } from "@/Theme/textStyles";
export var ConfigFormError = {
    parts: ["text"],
    baseStyle: {
        text: __assign({}, textStyles.ElementsRegularXS)
    },
    variants: {
        outline: {
            text: {
                color: "error"
            }
        }
    },
    defaultProps: {
        variant: "outline"
    }
};
