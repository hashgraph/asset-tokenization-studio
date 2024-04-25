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
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import { Input as ChakraInput, InputGroup as ChakraInputGroup, InputLeftElement as ChakraInputLeftElement, InputRightElement as ChakraInputRightElement, } from "@chakra-ui/input";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import React from "react";
import _merge from "lodash/merge";
import { Text } from "../../Foundations/Text";
import { Box as ChakraBox, Center, Flex as ChakraFlex, useBreakpointValue, } from "@chakra-ui/react";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { CheckCircle, Warning, X } from "@phosphor-icons/react";
import { IconButton } from "@Components/Interaction/IconButton";
export var inputPartsList = [
    "container",
    "addonLeft",
    "addonRight",
    "labelContainer",
    "label",
    "subLabel",
    "input",
    "errorIcon",
    "topDescription",
    "bottomDescription",
];
export var defaultInputSize = { base: "lg", lg: "md" };
export var Input = forwardRef(function (_a, ref) {
    var size = _a.size, variant = _a.variant, id = _a.id, AddonLeft = _a.addonLeft, AddonRight = _a.addonRight, isInvalid = _a.isInvalid, isDisabled = _a.isDisabled, isRequired = _a.isRequired, label = _a.label, subLabel = _a.subLabel, _b = _a.placeholder, placeholder = _b === void 0 ? " " : _b, _c = _a.showRequired, showRequired = _c === void 0 ? true : _c, isSuccess = _a.isSuccess, isClearable = _a.isClearable, onClear = _a.onClear, bottomDescription = _a.bottomDescription, topDescription = _a.topDescription, sx = _a.sx, props = __rest(_a, ["size", "variant", "id", "addonLeft", "addonRight", "isInvalid", "isDisabled", "isRequired", "label", "subLabel", "placeholder", "showRequired", "isSuccess", "isClearable", "onClear", "bottomDescription", "topDescription", "sx"]);
    var formControl = useChakraFormControlContext() || {};
    var invalid = isInvalid !== null && isInvalid !== void 0 ? isInvalid : formControl.isInvalid;
    var defaultSize = useBreakpointValue(defaultInputSize);
    var inputSize = size || defaultSize;
    var _d = useChakraMultiStyleConfig("Input", {
        size: inputSize,
        variant: variant,
        addonLeft: AddonLeft,
        addonRight: AddonRight,
        isInvalid: invalid,
        isSuccess: isSuccess,
        isDisabled: isDisabled,
        hasLabel: Boolean(label),
        isClearable: isClearable,
        onClear: onClear
    }), _e = _d.errorIcon, ThemeErrorIcon = _e === void 0 ? function () { return (React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Warning, variant: "error" }) })); } : _e, _f = _d.validIcon, ThemeValidIcon = _f === void 0 ? function () { return (React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: CheckCircle }) })); } : _f, _g = _d.clearIconButton, ThemeClearIcon = _g === void 0 ? function () { return (React.createElement(InputIconButton, { "aria-label": "Clear", onMouseDown: onClear, icon: React.createElement(PhosphorIcon, { as: X, weight: Weight.Bold }) })); } : _g, styles = __rest(_d, ["errorIcon", "validIcon", "clearIconButton"]);
    var inputStyle = React.useMemo(function () { return _merge(styles.input, sx); }, [styles.input, sx]);
    return (React.createElement(ChakraBox, { as: "label", sx: styles.labelContainer, htmlFor: id, flex: 1, position: "relative", ref: ref },
        label &&
            (React.isValidElement(label) ? (React.createElement(ChakraBox, { sx: styles.label }, label)) : (React.createElement(Text, { as: "span", id: "label", display: "flex", sx: styles.label },
                label,
                showRequired && isRequired && "*"))),
        subLabel &&
            (React.isValidElement(subLabel) ? (React.createElement(ChakraBox, { sx: styles.subLabel }, subLabel)) : (React.createElement(Text, { as: "span", id: "subLabel", display: "flex", sx: styles.subLabel }, subLabel))),
        topDescription &&
            (React.isValidElement(topDescription) ? (React.createElement(ChakraBox, { sx: styles.topDescription }, topDescription)) : (React.createElement(Text, { sx: styles.topDescription }, topDescription))),
        React.createElement(ChakraInputGroup, { overflow: "hidden", sx: styles.container },
            AddonLeft && (React.createElement(ChakraInputLeftElement, { children: AddonLeft, height: "full", sx: styles.addonLeft })),
            React.createElement(ChakraInput, __assign({ size: inputSize, variant: variant, id: id, sx: inputStyle, isDisabled: isDisabled, isInvalid: invalid, placeholder: placeholder }, props)),
            (AddonRight || isInvalid || isSuccess || isClearable) && (React.createElement(ChakraInputRightElement, { pointerEvents: "all", zIndex: "auto", height: "full", sx: styles.addonRight },
                isClearable && (React.createElement(ChakraFlex, { "data-testid": "input-clear-icon-button" },
                    React.createElement(ThemeClearIcon, null))),
                AddonRight,
                isInvalid && (React.createElement(ChakraFlex, { "data-testid": "input-error-icon" }, React.createElement(ThemeErrorIcon, null))),
                isSuccess && (React.createElement(ChakraFlex, { "data-testid": "input-success-icon" }, React.createElement(ThemeValidIcon, null)))))),
        bottomDescription &&
            (React.isValidElement(bottomDescription) ? (React.createElement(ChakraBox, { sx: styles.bottomDescription }, bottomDescription)) : (React.createElement(Text, { sx: styles.bottomDescription }, bottomDescription)))));
});
export var InputIcon = function (_a) {
    var icon = _a.icon;
    var SizedIcon = React.cloneElement(icon, __assign({ size: "xxs", weight: Weight.Fill, sx: { zIndex: 1 } }, icon.props));
    return (React.createElement(Center, { w: 6, h: 6 }, SizedIcon));
};
export var InputIconButton = function (_a) {
    var icon = _a.icon, props = __rest(_a, ["icon"]);
    var SizedIcon = React.cloneElement(icon, __assign({ size: "xxs", weight: Weight.Fill }, icon.props));
    return (React.createElement(IconButton, __assign({ size: "xs", variant: "tertiary", sx: { color: "inherit" }, icon: SizedIcon }, props)));
};
