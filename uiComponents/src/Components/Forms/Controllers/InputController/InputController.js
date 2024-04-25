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
import { Input } from "@Components/Forms/Input";
import { omit as _omit } from "lodash";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import React from "react";
export var InputController = function (props) {
    var _a;
    var control = props.control, id = props.id, variant = props.variant, _b = props.showErrors, showErrors = _b === void 0 ? true : _b, onChange = props.onChange, onBlur = props.onBlur, _c = props.showIsSuccess, showIsSuccess = _c === void 0 ? false : _c, defaultValue = props.defaultValue, _d = props.rules, rules = _d === void 0 ? {} : _d, _e = props.isClearable, isClearable = _e === void 0 ? false : _e, onClear = props.onClear;
    var _f = useController({
        name: id,
        control: control,
        rules: rules,
        defaultValue: defaultValue
    }), fieldState = _f.fieldState, _g = _f.field, onChangeDefault = _g.onChange, onBlurDefault = _g.onBlur, value = _g.value;
    // @ts-ignore
    var isRequired = !!(rules === null || rules === void 0 ? void 0 : rules["required"]) || !!((_a = rules === null || rules === void 0 ? void 0 : rules.validate) === null || _a === void 0 ? void 0 : _a["required"]);
    var inputProps = _omit(props, [
        "control",
        "rules",
        "showErrors",
        "onChange",
        "onBlur",
        "isClearable",
        "onClear",
    ]);
    return (React.createElement(FieldController, { fieldState: fieldState, errorMessageVariant: variant, showErrors: showErrors },
        React.createElement(Input, __assign({ "data-testid": id, name: id, isRequired: isRequired, isInvalid: !!fieldState.error, isSuccess: showIsSuccess && fieldState.isDirty && !fieldState.error, isClearable: isClearable && !!value, onClear: function (e) {
                // @ts-ignore dont have React.ChangeEventHandler<HTMLInputElement>
                onChange === null || onChange === void 0 ? void 0 : onChange(e);
                onChangeDefault(defaultValue);
                onClear && onClear();
            }, onChange: function (e) {
                onChange === null || onChange === void 0 ? void 0 : onChange(e);
                onChangeDefault(e);
            }, onBlur: function (e) {
                onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
                onBlurDefault();
            } }, inputProps, { value: value || "" }))));
};
