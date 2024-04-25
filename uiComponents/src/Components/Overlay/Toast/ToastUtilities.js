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
import { createStandaloneToast } from "@chakra-ui/toast";
import { useTheme } from "@chakra-ui/react";
import { Alert } from "@Components/Overlay/Alert";
import { DEFAULT_DURATION, isAlertStatus } from "./toastHelpers";
var toastFunc;
export var Component = undefined;
export var useToastDefaultOptions = undefined;
export var ToastConfigurator = function (configuratorProps) {
    var theme = useTheme();
    var component = configuratorProps.component, defaultOptions = configuratorProps.defaultOptions, restProps = __rest(configuratorProps, ["component", "defaultOptions"]);
    Component = component;
    useToastDefaultOptions = __assign(__assign({}, defaultOptions), { duration: (defaultOptions === null || defaultOptions === void 0 ? void 0 : defaultOptions.duration) || DEFAULT_DURATION });
    var toast = createStandaloneToast(__assign({ theme: theme, defaultOptions: useToastDefaultOptions }, restProps)).toast;
    toastFunc = toast;
    return null;
};
export var ToastUtilities = {
    show: function (_a) {
        var status = _a.status, props = __rest(_a, ["status"]);
        return toastFunc(__assign(__assign({}, props), { render: function (_a) {
                var onClose = _a.onClose, id = _a.id;
                return Component ? (React.createElement(Component, __assign({}, props, { status: status, onClose: onClose, id: id }))) : (React.createElement(Alert, { variant: props === null || props === void 0 ? void 0 : props.variant, title: props.title, description: props === null || props === void 0 ? void 0 : props.description, status: isAlertStatus(status) ? status : undefined, onClose: props === null || props === void 0 ? void 0 : props.onClose }));
            } }));
    },
    warning: function (props) {
        return toastFunc(__assign(__assign({}, props), { render: function (_a) {
                var onClose = _a.onClose, id = _a.id;
                return Component ? (React.createElement(Component, __assign({}, props, { onClose: onClose, id: id, status: "warning" }))) : (React.createElement(Alert, { variant: props === null || props === void 0 ? void 0 : props.variant, title: props.title, description: props === null || props === void 0 ? void 0 : props.description, status: "warning", onClose: props === null || props === void 0 ? void 0 : props.onClose }));
            } }));
    },
    success: function (props) {
        return toastFunc(__assign(__assign({}, props), { render: function (_a) {
                var onClose = _a.onClose, id = _a.id;
                return Component ? (React.createElement(Component, __assign({}, props, { onClose: onClose, id: id, status: "success" }))) : (React.createElement(Alert, { variant: props === null || props === void 0 ? void 0 : props.variant, title: props.title, description: props === null || props === void 0 ? void 0 : props.description, status: "success", onClose: props === null || props === void 0 ? void 0 : props.onClose }));
            } }));
    },
    error: function (props) {
        return toastFunc(__assign(__assign({}, props), { render: function (_a) {
                var onClose = _a.onClose, id = _a.id;
                return Component ? (React.createElement(Component, __assign({}, props, { onClose: onClose, id: id, status: "error" }))) : (React.createElement(Alert, { variant: props === null || props === void 0 ? void 0 : props.variant, title: props.title, description: props === null || props === void 0 ? void 0 : props.description, status: "error", onClose: props === null || props === void 0 ? void 0 : props.onClose }));
            } }));
    },
    info: function (props) {
        return toastFunc(__assign(__assign({}, props), { render: function (_a) {
                var onClose = _a.onClose, id = _a.id;
                return Component ? (React.createElement(Component, __assign({}, props, { onClose: onClose, id: id, status: "info" }))) : (React.createElement(Alert, { variant: props === null || props === void 0 ? void 0 : props.variant, title: props.title, description: props === null || props === void 0 ? void 0 : props.description, status: "info", onClose: props === null || props === void 0 ? void 0 : props.onClose }));
            } }));
    },
    close: function (toastId) {
        toastFunc.close(toastId);
    },
    closeAll: function () {
        toastFunc.closeAll();
    }
};
