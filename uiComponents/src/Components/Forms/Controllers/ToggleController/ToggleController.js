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
import { omit as _omit } from "lodash";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import React from "react";
import { Toggle } from "@Components/Forms/Toggle";
export var ToggleController = function (props) {
    var control = props.control, id = props.id, variant = props.variant, _a = props.showErrors, showErrors = _a === void 0 ? false : _a, onChange = props.onChange, onBlur = props.onBlur, defaultValue = props.defaultValue, _b = props.rules, rules = _b === void 0 ? {} : _b;
    var _c = useController({
        name: id,
        control: control,
        rules: rules,
        defaultValue: defaultValue
    }), fieldState = _c.fieldState, _d = _c.field, onChangeDefault = _d.onChange, onBlurDefault = _d.onBlur, value = _d.value;
    // @ts-ignore
    var toggleProps = _omit(props, [
        "control",
        "rules",
        "showErrors",
        "onChange",
        "onBlur",
    ]);
    return (React.createElement(FieldController, { fieldState: fieldState, errorMessageVariant: variant, showErrors: showErrors },
        React.createElement(Toggle, __assign({ "data-testid": id, name: id, isInvalid: !!fieldState.error, onChange: function (e) {
                onChange === null || onChange === void 0 ? void 0 : onChange(e);
                onChangeDefault(e);
            }, onBlur: function (e) {
                onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
                onBlurDefault();
            } }, toggleProps, { isChecked: value, value: value || "" }))));
};
