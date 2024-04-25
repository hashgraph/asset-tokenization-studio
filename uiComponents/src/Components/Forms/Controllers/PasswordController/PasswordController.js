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
import { useBoolean, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import { InputController } from "../InputController/InputController";
import React from "react";
import { Button } from "@Components/Interaction/Button";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations";
export var passwordControllerPartsList = ["iconShowPass", "iconHidePass"];
export var PasswordController = function (_a) {
    var iconShowPassword = _a.iconShowPassword, iconHidePassword = _a.iconHidePassword, variant = _a.variant, props = __rest(_a, ["iconShowPassword", "iconHidePassword", "variant"]);
    var _b = useBoolean(false), showPassword = _b[0], setShowPassword = _b[1];
    var _c = useChakraMultiStyleConfig("PasswordController", {
        inputVariant: variant
    }), _d = _c.iconShowPass, ThemeIconShowPass = _d === void 0 ? function () { return React.createElement(PhosphorIcon, { as: Eye }); } : _d, _e = _c.iconHidePass, ThemeIconHidePass = _e === void 0 ? function () { return React.createElement(PhosphorIcon, { as: EyeSlash }); } : _e;
    var iconShowPass = iconShowPassword || React.createElement(ThemeIconShowPass, null);
    var iconHidePass = iconHidePassword || React.createElement(ThemeIconHidePass, null);
    return (React.createElement(InputController, __assign({}, props, { variant: variant, addonRight: React.createElement(Button, { pointerEvents: "all", variant: "ghost", m: 0, p: 0, minW: 0, "data-testid": "toggle-password-visibility", onClick: setShowPassword.toggle, _hover: { bg: "transparent" }, _active: { bg: "transparent" }, "aria-label": showPassword ? "Hide Password" : "Show Password" }, showPassword ? iconHidePass : iconShowPass), type: showPassword ? "text" : "password" })));
};
