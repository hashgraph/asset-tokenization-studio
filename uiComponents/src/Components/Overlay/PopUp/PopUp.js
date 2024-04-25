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
import * as ChakraModal from "@chakra-ui/modal";
import { Flex as ChakraFlex } from "@chakra-ui/react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import { CloseButton } from "@Components/Interaction/CloseButton";
import { PopupFooter } from "./components";
import { DefaultPopup } from "./DefaultPopup";
import { PopupContext } from "./context/PopupContext";
export var popUpPartsList = [
    "body",
    "overlay",
    "footer",
    "header",
    "container",
    "icon",
    "title",
    "description",
    "contentContainer",
    "inputContainer",
];
export var PopUp = function (_a) {
    var _b = _a.showOverlay, showOverlay = _b === void 0 ? true : _b, _c = _a.showCloseButton, showCloseButton = _c === void 0 ? true : _c, footer = _a.footer, onCancel = _a.onCancel, onConfirm = _a.onConfirm, confirmText = _a.confirmText, cancelText = _a.cancelText, variant = _a.variant, title = _a.title, description = _a.description, icon = _a.icon, confirmButtonProps = _a.confirmButtonProps, cancelButtonProps = _a.cancelButtonProps, _d = _a.isContentCentered, isContentCentered = _d === void 0 ? true : _d, props = __rest(_a, ["showOverlay", "showCloseButton", "footer", "onCancel", "onConfirm", "confirmText", "cancelText", "variant", "title", "description", "icon", "confirmButtonProps", "cancelButtonProps", "isContentCentered"]);
    var styles = useChakraMultiStyleConfig("PopUp", {
        variant: variant,
        isContentCentered: isContentCentered,
        size: props.size
    });
    return (React.createElement(PopupContext.Provider, { value: {
            footer: footer,
            onCancel: onCancel,
            onConfirm: onConfirm,
            confirmText: confirmText,
            cancelText: cancelText,
            variant: variant,
            title: title,
            description: description,
            icon: icon,
            cancelButtonProps: cancelButtonProps,
            confirmButtonProps: confirmButtonProps,
            styles: styles
        } },
        React.createElement(ChakraModal.Modal, __assign({ isCentered: true }, props),
            showOverlay && (React.createElement(ChakraModal.ModalOverlay, { "data-testid": "popup-overlay", sx: styles.overlay })),
            React.createElement(ChakraModal.ModalContent, { sx: styles.container },
                showCloseButton && (React.createElement(CloseButton, { alignSelf: "flex-end", tabIndex: 0, sx: styles.closeButton, onClick: props.onClose })),
                React.createElement(ChakraModal.ModalBody, { sx: styles.body },
                    React.createElement(ChakraFlex, { sx: styles.contentContainer }, props.children || React.createElement(DefaultPopup, null))),
                React.createElement(PopupFooter, null)))));
};
