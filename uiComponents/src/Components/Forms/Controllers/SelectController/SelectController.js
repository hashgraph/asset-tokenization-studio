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
import { Select } from "../../Select";
import { omit as _omit } from "lodash";
import React, { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import _isEqual from "lodash/isEqual";
export var SelectController = function (props) {
    var _a;
    var control = props.control, id = props.id, options = props.options, rules = props.rules, _b = props.showErrors, showErrors = _b === void 0 ? true : _b, variant = props.variant, onChange = props.onChange, _c = props.setsFullOption, setsFullOption = _c === void 0 ? false : _c;
    var _d = useController({ name: id, control: control, rules: rules }), fieldState = _d.fieldState, _e = _d.field, onChangeDefault = _e.onChange, value = _e.value;
    var selectProps = _omit(props, ["control", "rules", "showErrors"]);
    var _f = useState(), selectedValue = _f[0], setSelectedValue = _f[1];
    // @ts-ignore
    var isRequired = !!(rules === null || rules === void 0 ? void 0 : rules["required"]) || !!((_a = rules === null || rules === void 0 ? void 0 : rules.validate) === null || _a === void 0 ? void 0 : _a["required"]);
    useEffect(function () {
        var newValue = options === null || options === void 0 ? void 0 : options.find(function (option) {
            if (value) {
                var valueToCompare = setsFullOption ? value.value : value;
                return _isEqual(option.value, valueToCompare);
            }
            return false;
        });
        setSelectedValue(newValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, options]);
    return (React.createElement(FieldController, { fieldState: fieldState, errorMessageVariant: variant, showErrors: showErrors },
        React.createElement(Select, __assign({}, selectProps, { "data-testid": id, inputId: id, name: id, isRequired: isRequired, 
            // @ts-ignore
            onChange: function (val) {
                onChange === null || onChange === void 0 ? void 0 : onChange(setsFullOption ? val : val.value);
                onChangeDefault(setsFullOption ? val : val.value);
            }, value: selectedValue || "" }))));
};
