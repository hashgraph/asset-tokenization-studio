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
import { Weight } from "@/Components/Foundations/PhosphorIcon";
import { focusVisible } from "@/Theme/utils";
export var ConfigDropdown = {
    parts: [
        "wrapper",
        "container",
        "itemContainer",
        "itemIconWeight",
        "itemLabel",
    ],
    baseStyle: function (_a) {
        var isDisabled = _a.isDisabled, isActive = _a.isActive, hasMaxHeight = _a.hasMaxHeight, hasMaxWidth = _a.hasMaxWidth;
        return ({
            wrapper: __assign(__assign({ bg: "neutral", pt: 0, pb: 0, borderRadius: "8px", boxShadow: "0px 0px 5px 0px rgba(50, 50, 50, 0.2)" }, (hasMaxWidth && { maxW: "300px", overflowX: "hidden" })), { minW: "45px", border: 0 }),
            container: __assign({ p: 2 }, (hasMaxHeight && { maxH: "264px", overflow: "auto" })),
            itemLabel: __assign({ textStyle: "ElementsMediumSM", color: "neutral.700" }, (isDisabled && {
                color: "neutral.200"
            })),
            itemIconWeight: isActive ? Weight.Fill : Weight.Regular,
            itemContainer: __assign(__assign({ _focusVisible: __assign(__assign({}, focusVisible), { borderRadius: "simple" }), py: "2px", px: 2, bg: "neutral", borderRadius: "simple", color: "neutral.700", transition: "all .3s ease", gap: 2, _focus: {
                    textDecor: "none !important"
                }, svg: {
                    color: "inherit",
                    transition: "all .3s ease"
                }, _hover: {
                    bg: "neutral.100"
                } }, (isActive && {
                bg: "primary.50",
                _hover: {
                    bg: "primary.50"
                }
            })), (isDisabled && {
                color: "neutral.200",
                bg: "transparent",
                cursor: isDisabled ? "not-allowed" : "pointer",
                _hover: {
                    bg: "transparent"
                }
            }))
        });
    }
};
