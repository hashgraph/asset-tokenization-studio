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
import { progressPartsList } from "@/Components/Indicators/Progress";
export var ConfigProgress = {
    parts: progressPartsList,
    baseStyle: function (_a) {
        var isIndeterminate = _a.isIndeterminate;
        return ({
            filledTrack: __assign({ backgroundColor: "green.500" }, (isIndeterminate && {
                backgroundImage: "linear-gradient( to right, transparent 0%, var(--chakra-colors-green-500) 50%, transparent 100% )"
            })),
            track: {
                backgroundColor: "neutral.100"
            }
        });
    },
    defaultProps: {
        size: "md"
    }
};
