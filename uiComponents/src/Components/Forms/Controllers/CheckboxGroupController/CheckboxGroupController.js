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
import { FieldController } from "../FieldController/FieldController";
import { useController } from "react-hook-form";
import { Flex as ChakraFlex, useCheckboxGroup } from "@chakra-ui/react";
import { Checkbox } from "@Components/Forms/Checkbox";
export var CheckboxGroupController = function (_a) {
    var errorMessageVariant = _a.errorMessageVariant, control = _a.control, id = _a.id, variant = _a.variant, _b = _a.showErrors, showErrors = _b === void 0 ? false : _b, onChange = _a.onChange, onBlur = _a.onBlur, defaultValueProp = _a.defaultValue, _c = _a.rules, rules = _c === void 0 ? {} : _c, options = _a.options, checkboxComponentProps = _a.checkboxProps, props = __rest(_a, ["errorMessageVariant", "control", "id", "variant", "showErrors", "onChange", "onBlur", "defaultValue", "rules", "options", "checkboxProps"]);
    var _d = useController({
        name: id,
        control: control,
        rules: rules,
        defaultValue: defaultValueProp
    }), fieldState = _d.fieldState, _e = _d.field, onChangeDefault = _e.onChange, value = _e.value;
    var getCheckboxProps = useCheckboxGroup({
        onChange: onChangeDefault,
        value: value
    }).getCheckboxProps;
    return (React.createElement(FieldController, { fieldState: fieldState, errorMessageVariant: errorMessageVariant, showErrors: showErrors },
        React.createElement(ChakraFlex, __assign({ gap: 4 }, props), options.map(function (_a) {
            var value = _a.value, label = _a.label;
            var checkboxProps = getCheckboxProps({ value: value });
            return (React.createElement(Checkbox, __assign({ key: value, variant: variant }, checkboxComponentProps, checkboxProps, { onChange: function (e) {
                    var _a;
                    (_a = checkboxProps.onChange) === null || _a === void 0 ? void 0 : _a.call(checkboxProps, e);
                    onChange === null || onChange === void 0 ? void 0 : onChange(e);
                } }), label));
        }))));
};
