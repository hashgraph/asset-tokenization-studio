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
import { infoDividerPartsList } from "@Components/DataDisplay/InfoDivider";
export var ConfigInfoDivider = {
    parts: infoDividerPartsList,
    baseStyle: function (_a) {
        var type = _a.type, hasStep = _a.hasStep, hasNumber = _a.hasNumber;
        var isMain = type === "main";
        var isSecondary = type === "secondary";
        var titleColor = isSecondary ? "primary.700 " : "neutral.900";
        return {
            container: {
                gridTemplateColumns: isMain ? "auto 1fr" : "1fr",
                alignItems: isMain ? "center" : "flex-start",
                gap: isMain ? 4 : 3,
                w: "full"
            },
            titleContainer: __assign({ gap: hasStep ? 5 : 2 }, (hasStep && { ml: 3 })),
            number: {
                color: "primary.500",
                textStyle: "HeadingMediumMD"
            },
            title: __assign(__assign({ textStyle: "HeadingMediumMD", color: titleColor }, (isMain && {
                maxW: "376px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
            })), (isSecondary && {
                noOfLines: 2
            })),
            step: {
                textStyle: "ElementsMediumMD",
                pos: "relative",
                color: "neutral",
                zIndex: 0,
                _before: {
                    content: "\"\"",
                    position: "absolute",
                    bg: "primary.400",
                    w: 8,
                    h: 8,
                    zIndex: -1,
                    left: "50%",
                    top: "50%",
                    borderRadius: "full",
                    transform: "translate(-50%, -50%)"
                }
            },
            divider: {
                borderColor: isMain ? "primary.400" : "neutral.400"
            }
        };
    }
};
