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
import React from "react";
import { FormLabel as ChakraFormLabel, useFormControlContext as useChakraFormControlContext, } from "@chakra-ui/form-control";
import { Center, Flex as ChakraFlex, Stack as ChakraStack, } from "@chakra-ui/layout";
import { useBreakpointValue } from "@chakra-ui/react";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import { Select as ChakraSelect, } from "chakra-react-select";
import { Text } from "@/Components/Foundations/Text";
import { defaultInputSize, InputIcon } from "../Input";
import { CaretDown, Warning } from "@phosphor-icons/react";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { Spinner } from "@Components/Indicators/Spinner";
export var Select = forwardRef(function (_a, ref) {
    var size = _a.size, variant = _a.variant, addonLeft = _a.addonLeft, addonRight = _a.addonRight, dropdownIndicator = _a.dropdownIndicator, loadingIndicator = _a.loadingIndicator, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, isInvalid = _a.isInvalid, isDisabled = _a.isDisabled, placeholder = _a.placeholder, overrideStyles = _a.overrideStyles, isRequired = _a.isRequired, _c = _a.showRequired, showRequired = _c === void 0 ? true : _c, label = _a.label, value = _a.value, id = _a.id, props = __rest(_a, ["size", "variant", "addonLeft", "addonRight", "dropdownIndicator", "loadingIndicator", "isLoading", "isInvalid", "isDisabled", "placeholder", "overrideStyles", "isRequired", "showRequired", "label", "value", "id"]);
    var defaultSize = useBreakpointValue(defaultInputSize);
    var inputSize = size || defaultSize;
    var formControl = useChakraFormControlContext() || {};
    var invalid = isInvalid !== null && isInvalid !== void 0 ? isInvalid : formControl.isInvalid;
    var inputStyles = useChakraMultiStyleConfig("Input", {
        size: inputSize,
        variant: variant,
        addonLeft: addonLeft,
        addonRight: addonRight,
        isInvalid: invalid,
        isDisabled: isDisabled,
        hasLabel: Boolean(label)
    });
    var dropdownStyles = useChakraMultiStyleConfig("Dropdown", {
        hasMaxHeight: true
    });
    var optionActiveStyle = useChakraMultiStyleConfig("Dropdown", {
        isActive: true,
        hasMaxHeight: true
    }).itemContainer;
    var chakraStyles = getChakraStyles({
        dropdownStyles: dropdownStyles,
        inputStyles: inputStyles,
        overrideStyles: overrideStyles,
        optionActiveStyle: optionActiveStyle
    });
    return (React.createElement(ChakraFormLabel, { sx: inputStyles.labelContainer, htmlFor: id, flex: 1, position: "relative" },
        label && (React.createElement(Text, { as: "span", id: "label", display: "flex", sx: inputStyles.label },
            label,
            showRequired && isRequired && "*")),
        React.createElement(ChakraSelect, __assign({ ref: ref, isInvalid: invalid, isDisabled: isDisabled, id: id, components: {
                IndicatorSeparator: null,
                DropdownIndicator: function () { return (React.createElement(DropdownIndicator, { inputStyles: inputStyles, addonRight: addonRight, invalid: invalid, dropdownIndicator: dropdownIndicator, isLoading: isLoading, loadingIndicator: loadingIndicator })); },
                SelectContainer: function (_a) {
                    var children = _a.children;
                    return (React.createElement(SelectContainer, { addonLeft: addonLeft, inputStyles: inputStyles }, children));
                },
                MenuList: function (_a) {
                    var children = _a.children;
                    return (React.createElement(ChakraStack, { spacing: 1, sx: dropdownStyles.container }, children));
                }
            }, placeholder: placeholder, size: inputSize, chakraStyles: chakraStyles, variant: variant, value: value }, props))));
});
var getChakraStyles = function (_a) {
    var dropdownStyles = _a.dropdownStyles, inputStyles = _a.inputStyles, overrideStyles = _a.overrideStyles, optionActiveStyle = _a.optionActiveStyle;
    return __assign({ option: function (_, state) { return (__assign(__assign({}, dropdownStyles.itemContainer), (state.isSelected && optionActiveStyle))); }, inputContainer: function (styles) { return (__assign(__assign({}, styles), { paddingTop: 0, paddingBottom: 0 })); }, valueContainer: function (styles) { return (__assign(__assign({}, styles), { paddingTop: 0, paddingBottom: 0 })); }, control: function (styles) { return (__assign(__assign({}, styles), inputStyles.input)); }, menu: function (styles) { return (__assign(__assign(__assign({}, styles), { left: 0 }), dropdownStyles.wrapper)); } }, overrideStyles);
};
var DropdownIndicator = function (_a) {
    var inputStyles = _a.inputStyles, addonRight = _a.addonRight, invalid = _a.invalid, dropdownIndicator = _a.dropdownIndicator, isLoading = _a.isLoading, loadingIndicator = _a.loadingIndicator;
    var ThemeErrorIcon = inputStyles.errorIcon;
    return (React.createElement(ChakraFlex, { pointerEvents: "all", zIndex: "auto", 
        // these styles are here to ensure that the addonRight positions correctly by default
        height: "full", right: "0", align: "center", position: "absolute", sx: inputStyles.addonRight },
        addonRight,
        invalid && (React.createElement(ChakraFlex, { "data-testid": "select-error-icon" }, ThemeErrorIcon ? (React.createElement(ThemeErrorIcon, null)) : (React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Warning, variant: "error" }) })))),
        isLoading
            ? loadingIndicator || React.createElement(Spinner, null)
            : dropdownIndicator || (React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: CaretDown, weight: Weight.Regular }) }))));
};
var SelectContainer = function (_a) {
    var addonLeft = _a.addonLeft, inputStyles = _a.inputStyles, children = _a.children;
    return (React.createElement(ChakraFlex, { position: "relative" },
        addonLeft && (React.createElement(Center
        // these styles are here to ensure that the addonLeft positions correctly by default
        , { 
            // these styles are here to ensure that the addonLeft positions correctly by default
            pos: "absolute", left: "0", children: addonLeft, height: "full", sx: inputStyles.addonLeft })),
        children));
};
