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
import { Textarea } from "../../Textarea";
export var TextareaController = function (props) {
    var _a;
    var control = props.control, id = props.id, variant = props.variant, _b = props.showErrors, showErrors = _b === void 0 ? true : _b, onChange = props.onChange, onBlur = props.onBlur, _c = props.showIsSuccess, showIsSuccess = _c === void 0 ? false : _c, defaultValue = props.defaultValue, _d = props.rules, rules = _d === void 0 ? {} : _d;
    var _e = useController({
        name: id,
        control: control,
        rules: rules,
        defaultValue: defaultValue
    }), fieldState = _e.fieldState, _f = _e.field, onChangeDefault = _f.onChange, onBlurDefault = _f.onBlur, value = _f.value;
    // @ts-ignore
    var isRequired = !!(rules === null || rules === void 0 ? void 0 : rules["required"]) || !!((_a = rules === null || rules === void 0 ? void 0 : rules.validate) === null || _a === void 0 ? void 0 : _a["required"]);
    var textareaProps = _omit(props, [
        "control",
        "rules",
        "showErrors",
        "onChange",
        "onBlur",
        "showIsSuccess",
    ]);
    return (React.createElement(FieldController, { fieldState: fieldState, errorMessageVariant: variant, showErrors: showErrors },
        React.createElement(Textarea, __assign({ "data-testid": id, name: id, isRequired: isRequired, isInvalid: !!fieldState.error, isSuccess: showIsSuccess && fieldState.isDirty && !fieldState.error, onChange: function (e) {
                onChange === null || onChange === void 0 ? void 0 : onChange(e);
                onChangeDefault(e);
            }, onBlur: function (e) {
                onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
                onBlurDefault();
            } }, textareaProps, { value: value || "" }))));
};
