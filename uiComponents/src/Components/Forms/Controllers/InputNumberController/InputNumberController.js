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
import { useController } from "react-hook-form";
import React from "react";
import { useNumericFormat, NumericFormat } from "react-number-format";
import { omit as _omit } from "lodash";
import { FieldController } from "../FieldController/FieldController";
import { Input } from "@Components/Forms/Input";
export var InputNumberController = function (_a) {
    var _b;
    var _c = _a.thousandSeparator, thousandSeparator = _c === void 0 ? "." : _c, _d = _a.decimalSeparator, decimalSeparator = _d === void 0 ? "," : _d, control = _a.control, id = _a.id, variant = _a.variant, _e = _a.showErrors, showErrors = _e === void 0 ? true : _e, onChange = _a.onChange, onBlur = _a.onBlur, label = _a.label, _f = _a.showIsSuccess, showIsSuccess = _f === void 0 ? false : _f, defaultValue = _a.defaultValue, _g = _a.rules, rules = _g === void 0 ? {} : _g, maxValue = _a.maxValue, minValue = _a.minValue, props = __rest(_a, ["thousandSeparator", "decimalSeparator", "control", "id", "variant", "showErrors", "onChange", "onBlur", "label", "showIsSuccess", "defaultValue", "rules", "maxValue", "minValue"]);
    var _h = useController({
        name: id,
        control: control,
        rules: rules,
        defaultValue: defaultValue
    }), fieldState = _h.fieldState, _j = _h.field, onChangeDefault = _j.onChange, onBlurDefault = _j.onBlur, value = _j.value;
    // @ts-ignore
    var isRequired = !!(rules === null || rules === void 0 ? void 0 : rules["required"]) || !!((_b = rules === null || rules === void 0 ? void 0 : rules.validate) === null || _b === void 0 ? void 0 : _b["required"]);
    var inputProps = _omit(props, [
        "control",
        "rules",
        "showErrors",
        "onChange",
        "onBlur",
    ]);
    var checkIsAllowed = function (_a) {
        var floatValue = _a.floatValue;
        if (typeof floatValue !== "number") {
            return true;
        }
        if (typeof maxValue === "number" && floatValue > maxValue) {
            return false;
        }
        return true;
    };
    var format = useNumericFormat({
        thousandSeparator: thousandSeparator,
        decimalSeparator: decimalSeparator,
        suffix: props.suffix,
        prefix: props.prefix
    }).format;
    var handleBlur = function (e) {
        if (typeof minValue === "number" && value < minValue) {
            onChangeDefault(minValue);
            onChange === null || onChange === void 0 ? void 0 : onChange({
                floatValue: minValue,
                value: minValue.toString(),
                formattedValue: format(minValue.toString())
            }, {
                // @ts-ignore SourceType not exported
                source: "prop"
            });
        }
        onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
        onBlurDefault();
    };
    return (React.createElement(FieldController, { fieldState: fieldState, errorMessageVariant: variant, showErrors: showErrors },
        React.createElement(Input, __assign({ as: NumericFormat, "data-testid": id, decimalSeparator: decimalSeparator, thousandSeparator: thousandSeparator, name: id, isRequired: isRequired, isInvalid: !!fieldState.error, isSuccess: showIsSuccess && fieldState.isDirty && !fieldState.error, isAllowed: checkIsAllowed, onBlur: handleBlur, label: label }, inputProps, { value: value || "", onValueChange: function (values, sourceInfo) {
                var _a;
                onChange === null || onChange === void 0 ? void 0 : onChange(values, sourceInfo);
                onChangeDefault((_a = values.floatValue) !== null && _a !== void 0 ? _a : "");
            } }))));
};
