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
import { useToast as useChakraToast } from "@chakra-ui/react";
import { Alert } from "@Components/Overlay/Alert";
import { DEFAULT_DURATION, isAlertStatus } from "./toastHelpers";
import { Component, useToastDefaultOptions } from "./ToastUtilities";
import _merge from "lodash/merge";
export function useToast() {
    var toast = useChakraToast();
    var show = function (_a) {
        var status = _a.status, _b = _a.duration, durationProp = _b === void 0 ? DEFAULT_DURATION : _b, _c = _a.position, position = _c === void 0 ? "top-right" : _c, toastOptions = __rest(_a, ["status", "duration", "position"]);
        var alertStatus = isAlertStatus(status) ? status : undefined;
        var _d = (useToastDefaultOptions || {}), defaultDuration = _d.duration, restDefaultProps = __rest(_d, ["duration"]);
        var options = _merge({}, restDefaultProps, toastOptions);
        var duration = durationProp || defaultDuration;
        return toast(__assign(__assign({ render: function (props) {
                var onClose = function () {
                    var _a, _b;
                    (_a = props.onClose) === null || _a === void 0 ? void 0 : _a.call(props);
                    (_b = toast.close) === null || _b === void 0 ? void 0 : _b.call(toast, props.id);
                };
                return Component ? (React.createElement(Component, __assign({}, toastOptions, props, { duration: props.duration || duration, onClose: onClose, status: status, id: props.id }))) : (React.createElement(Alert, { status: alertStatus, variant: toastOptions === null || toastOptions === void 0 ? void 0 : toastOptions.variant, title: toastOptions.title, description: toastOptions.description, onClose: onClose }));
            } }, options), { duration: duration, status: alertStatus, position: position }));
    };
    var close = function (id) {
        toast.close(id);
    };
    var closeAll = function () {
        toast.closeAll();
    };
    return {
        close: close,
        closeAll: closeAll,
        show: show
    };
}
