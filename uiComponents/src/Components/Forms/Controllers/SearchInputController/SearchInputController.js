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
import { InputController } from "../InputController/InputController";
import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations";
import { IconButton } from "@/Components/Interaction";
export var SearchInputController = function (_a) {
    var variant = _a.variant, control = _a.control, rules = _a.rules, id = _a.id, defaultValue = _a.defaultValue, _b = _a.minSearchLength, minSearchLength = _b === void 0 ? 3 : _b, onSearch = _a.onSearch, props = __rest(_a, ["variant", "control", "rules", "id", "defaultValue", "minSearchLength", "onSearch"]);
    var _c = useController({
        name: id,
        control: control,
        rules: rules,
        defaultValue: defaultValue
    }).field, onChangeDefault = _c.onChange, value = _c.value;
    var isDisabled = !value || value.length < minSearchLength;
    var handleSearch = function () {
        onSearch(value);
    };
    return (React.createElement(InputController, __assign({ id: id, control: control, variant: variant, isClearable: true, onChange: function (e) {
            onChangeDefault(e);
        }, onKeyDown: function (ev) {
            !isDisabled && ev.key === "Enter" && handleSearch();
        } }, props, { addonRight: React.createElement(IconButton, { "data-testid": "search-icon-button", size: "xs", "aria-label": "search", variant: "tertiary", icon: React.createElement(PhosphorIcon, { as: MagnifyingGlass }), isDisabled: isDisabled, onClick: handleSearch }) })));
};
