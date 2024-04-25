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
import { Flex } from "@chakra-ui/react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import _merge from "lodash/merge";
import { PopUpText } from "./components";
import { InputController } from "@/Components/Forms";
import { useForm } from "react-hook-form";
import { PopUp } from "./PopUp";
export var ConfirmationPopUp = function (_a) {
    var confirmationText = _a.confirmationText, onConfirm = _a.onConfirm, _b = _a.placeholder, placeholder = _b === void 0 ? confirmationText : _b, confirmButtonProps = _a.confirmButtonProps, inputProps = _a.inputProps, _c = _a.errorMessage, errorMessage = _c === void 0 ? "" : _c, _d = _a.label, label = _d === void 0 ? "" : _d, variant = _a.variant, title = _a.title, description = _a.description, isContentCentered = _a.isContentCentered, onCloseComplete = _a.onCloseComplete, children = _a.children, props = __rest(_a, ["confirmationText", "onConfirm", "placeholder", "confirmButtonProps", "inputProps", "errorMessage", "label", "variant", "title", "description", "isContentCentered", "onCloseComplete", "children"]);
    var _e = useForm({
        mode: "onChange"
    }), control = _e.control, isValid = _e.formState.isValid, watch = _e.watch, reset = _e.reset;
    var styles = useChakraMultiStyleConfig("PopUp", {
        variant: variant,
        isContentCentered: isContentCentered
    });
    var handleConfirm = function () {
        if (watch("confirmation") !== confirmationText)
            return;
        onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm();
    };
    var confirmButtonPropsWithDefault = _merge({
        isDisabled: !isValid
    }, confirmButtonProps);
    var defaultInputProps = _merge({
        rules: {
            required: true,
            validate: function (value) { return value === confirmationText || errorMessage; }
        },
        label: label
    }, inputProps);
    return (React.createElement(PopUp, __assign({}, props, { onConfirm: handleConfirm, confirmButtonProps: confirmButtonPropsWithDefault, isContentCentered: false, onCloseComplete: function () {
            reset();
            onCloseComplete === null || onCloseComplete === void 0 ? void 0 : onCloseComplete();
        } }),
        children || (React.createElement(React.Fragment, null,
            title && React.createElement(PopUpText, { label: title, type: "title" }),
            description && React.createElement(PopUpText, { label: description, type: "description" }))),
        React.createElement(Flex, { sx: styles.inputContainer, w: "full" },
            React.createElement(InputController, __assign({ control: control, id: "confirmation", placeholder: placeholder, size: "sm" }, defaultInputProps)))));
};
