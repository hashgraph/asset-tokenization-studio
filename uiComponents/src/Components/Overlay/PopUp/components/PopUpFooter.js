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
import React from "react";
import { ModalFooter } from "@chakra-ui/modal";
import { Button } from "@Components/Interaction/Button";
import { usePopupContext } from "../context/PopupContext";
export var PopupFooter = function (_a) {
    var _b = _a.confirmText, okTextArg = _b === void 0 ? "Ok" : _b, _c = _a.cancelText, cancelTextArg = _c === void 0 ? "Cancel" : _c, onCancelArg = _a.onCancel, onConfirmArg = _a.onConfirm, cancelButtonPropsArg = _a.cancelButtonProps, confirmButtonPropsArg = _a.confirmButtonProps;
    var _d = usePopupContext(), footer = _d.footer, _e = _d.onCancel, onCancel = _e === void 0 ? onCancelArg : _e, _f = _d.onConfirm, onConfirm = _f === void 0 ? onConfirmArg : _f, _g = _d.confirmText, confirmText = _g === void 0 ? okTextArg : _g, _h = _d.cancelText, cancelText = _h === void 0 ? cancelTextArg : _h, _j = _d.confirmButtonProps, confirmButtonProps = _j === void 0 ? confirmButtonPropsArg : _j, _k = _d.cancelButtonProps, cancelButtonProps = _k === void 0 ? cancelButtonPropsArg : _k, styles = _d.styles;
    return (React.createElement(ModalFooter, { sx: styles.footer }, footer || (React.createElement(React.Fragment, null,
        onCancel && (React.createElement(Button, __assign({ variant: "secondary", "aria-label": "cancel-button", onClick: onCancel, size: "md" }, cancelButtonProps), cancelText)),
        onConfirm && (React.createElement(Button, __assign({ variant: "primary", "aria-label": "ok-button", ml: 5, size: "md", onClick: onConfirm, tabIndex: 1 }, confirmButtonProps), confirmText))))));
};
