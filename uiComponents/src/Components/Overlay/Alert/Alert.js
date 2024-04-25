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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Alert as ChakraAlert, AlertDescription as ChakraAlertDescription, } from "@chakra-ui/alert";
import { Box as ChakraBox, Flex as ChakraFlex, Center as ChakraCenter, } from "@chakra-ui/layout";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import React from "react";
import { Text } from "@/Components/Foundations/Text";
import { CloseButton } from "@Components/Interaction/CloseButton";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
export var alertPartsList = [
    "container",
    "contentContainer",
    "title",
    "description",
    "icon",
    "spinner",
    "closeBtn",
];
export var Alert = forwardRef(function (_a, ref) {
    var children = _a.children, _b = _a.status, status = _b === void 0 ? "info" : _b, _c = _a.showIcon, showIcon = _c === void 0 ? true : _c, _d = _a.isInline, isInline = _d === void 0 ? true : _d, onClose = _a.onClose, variant = _a.variant, props = __rest(_a, ["children", "status", "showIcon", "isInline", "onClose", "variant"]);
    var styles = useChakraMultiStyleConfig("Alert", {
        variant: variant,
        status: status
    });
    var _e = styles.icon, weight = _e.weight, IconComponent = _e.as, restIconStyles = __rest(_e, ["weight", "as"]);
    var Icon = React.useMemo(function () {
        var _a;
        return status === "loading" ? (React.createElement(ChakraCenter, { sx: restIconStyles }, React.cloneElement(IconComponent, {
            size: "xxs",
            color: (_a = restIconStyles["__css"]) === null || _a === void 0 ? void 0 : _a.color
        }))) : (React.createElement(PhosphorIcon, __assign({}, styles.icon, { weight: weight })));
    }, [status, restIconStyles, IconComponent, weight, styles.icon]);
    return (React.createElement(ChakraAlert, __assign({ ref: ref, status: status }, props, { sx: styles.container }),
        React.createElement(ChakraFlex, { w: "full", h: "full", sx: styles.contentContainer },
            showIcon && Icon,
            children ? (React.createElement(ChakraBox, { flex: 1 }, children)) : (React.createElement(ChakraFlex, { "data-testid": "alert-content", direction: isInline ? "row" : "column", flex: 1 },
                React.createElement(ChakraAlertDescription, { sx: styles.description },
                    React.createElement(Text, { as: "span" },
                        props.title && (React.createElement(Text, { as: "span", sx: styles.title }, props.title)),
                        props.description))))),
        onClose && (React.createElement(CloseButton, { sx: styles.closeBtn, onClick: onClose, size: "xs" }))));
});
