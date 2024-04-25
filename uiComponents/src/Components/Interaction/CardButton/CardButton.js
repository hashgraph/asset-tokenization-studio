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
import { Button as ChakraButton, Flex as ChakraFlex, forwardRef, useMultiStyleConfig, } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import _merge from "lodash/merge";
import { Check } from "@phosphor-icons/react";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { Tooltip } from "@Components/Overlay/Tooltip";
export var cardButtonPartsList = ["container", "content", "icon", "text", "check", "tooltip"];
export var CardButton = forwardRef(function (_a, ref) {
    var icon = _a.icon, text = _a.text, isSelected = _a.isSelected, sx = _a.sx, props = __rest(_a, ["icon", "text", "isSelected", "sx"]);
    var themeStyles = useMultiStyleConfig("CardButton", {
        isSelected: isSelected
    });
    var styles = React.useMemo(function () { return _merge(themeStyles, sx); }, [themeStyles, sx]);
    var textRef = useRef(null);
    var _b = useState(false), isOverflowed = _b[0], setIsOverflowed = _b[1];
    useEffect(function () {
        if (textRef.current) {
            setIsOverflowed(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
    }, []);
    return (React.createElement(Tooltip, { "data-testid": "card-button-tooltip", label: text, isDisabled: !isOverflowed, gutter: -10, sx: styles.tooltip },
        React.createElement(ChakraButton, __assign({ "data-testid": "card-button-button", ref: ref, sx: styles.container }, props),
            React.createElement(ChakraFlex, { sx: styles.content },
                isSelected && (React.createElement(ChakraFlex, { "data-testid": "card-button-check-container", sx: styles.check },
                    React.createElement(PhosphorIcon, { as: Check, size: "xxs" }))),
                React.createElement(CardButtonIcon, { icon: icon }),
                React.createElement(Text, { ref: textRef, sx: styles.text }, text)))));
});
export var CardButtonIcon = function (_a) {
    var icon = _a.icon;
    var styles = useMultiStyleConfig("CardButton", {});
    return React.cloneElement(icon, __assign({ sx: __assign({}, styles.icon), weight: Weight.Regular, size: "md" }, icon.props));
};
