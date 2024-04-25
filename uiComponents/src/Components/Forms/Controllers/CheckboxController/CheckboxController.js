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
import { Checkbox } from "@Components/Forms/Checkbox";
import { omit as _omit } from "lodash";
import { FieldController } from "../FieldController/FieldController";
import { useController } from "react-hook-form";
import React from "react";
export var CheckboxController = function (props) {
    var control = props.control, id = props.id, variant = props.variant, _a = props.showErrors, showErrors = _a === void 0 ? true : _a, onChange = props.onChange, onBlur = props.onBlur, defaultValue = props.defaultValue, errorMessageVariant = props.errorMessageVariant, _b = props.rules, rules = _b === void 0 ? {} : _b;
    var _c = useController({
        name: id,
        control: control,
        rules: rules,
        defaultValue: defaultValue
    }), fieldState = _c.fieldState, _d = _c.field, onChangeDefault = _d.onChange, onBlurDefault = _d.onBlur, value = _d.value;
    var checkboxProps = _omit(props, [
        "control",
        "rules",
        "showErrors",
        "onChange",
        "onBlur",
        "defaultValue",
        "errorMessageVariant",
    ]);
    return (React.createElement(FieldController, { fieldState: fieldState, errorMessageVariant: errorMessageVariant, showErrors: showErrors },
        React.createElement(Checkbox, __assign({ variant: variant, "data-testid": id, isInvalid: !!(fieldState === null || fieldState === void 0 ? void 0 : fieldState.error), defaultChecked: value || defaultValue, onChange: function (e) {
                onChange === null || onChange === void 0 ? void 0 : onChange(e);
                onChangeDefault(e);
            }, onBlur: function (e) {
                onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
                onBlurDefault();
            } }, checkboxProps))));
};
