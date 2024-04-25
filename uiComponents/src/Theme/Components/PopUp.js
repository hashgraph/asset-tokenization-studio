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
import { popUpPartsList } from "@Components/Overlay/PopUp";
export var ConfigPopUp = {
    parts: popUpPartsList,
    baseStyle: function (_a) {
        var isContentCentered = _a.isContentCentered, size = _a.size;
        return ({
            container: __assign(__assign({ shadow: "xs", borderRadius: "8px", paddingTop: 8, paddingX: 4, justifyContent: "center" }, (size !== "full" && {
                minH: "260px"
            })), (!isContentCentered && {
                minH: 72
            })),
            icon: {
                color: "primary.400",
                marginBottom: "12px"
            },
            title: {
                color: "neutral.900",
                fontWeight: "500",
                lineHeight: "24px",
                fontSize: "16px",
                margin: "2px 0"
            },
            closeButton: {
                minW: "16px",
                minH: "16px",
                position: "absolute",
                top: "8px",
                right: "8px"
            },
            description: {
                fontWeight: "400",
                lineHeight: "16px",
                color: "neutral.700",
                fontSize: "12px",
                margin: "2px 0"
            },
            contentContainer: __assign({ justifyContent: "center", alignItems: "center", height: "full", flexDirection: "column", fontSize: "5rem", width: "full", mt: 4 }, (!isContentCentered && {
                alignItems: "left"
            })),
            body: __assign({ fontSize: "5rem", display: "flex", flexDirection: "column", padding: 0, justifyContent: "center", alignItems: "center" }, (!isContentCentered && {
                alignItems: "start",
                textAlign: "left"
            })),
            footer: __assign({ justifyContent: "center", pt: 6, pb: 8 }, (!isContentCentered && {
                justifyContent: "flex-end",
                width: "full",
                px: 0
            })),
            inputContainer: {
                mt: 6
            }
        });
    }
};
