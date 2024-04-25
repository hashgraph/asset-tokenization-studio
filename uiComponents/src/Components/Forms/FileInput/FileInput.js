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
import { useMultiStyleConfig, forwardRef, Input as ChakraInput, Center as ChakraCenter, } from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import _merge from "lodash/merge";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { CloudArrowDown } from "@phosphor-icons/react";
import { Text } from "@/Components/Foundations/Text";
export var fileInputPartsList = ["container", "icon", "label", "description", "input"];
export var FileInput = forwardRef(function (_a, ref) {
    var label = _a.label, description = _a.description, isInvalid = _a.isInvalid, isDisabled = _a.isDisabled, acceptedFileTypes = _a.acceptedFileTypes, onChange = _a.onChange, sx = _a.sx, props = __rest(_a, ["label", "description", "isInvalid", "isDisabled", "acceptedFileTypes", "onChange", "sx"]);
    var _b = useState(false), isDragging = _b[0], setIsDragging = _b[1];
    var fileRef = useRef(null);
    var inputFileRef = useRef(null);
    var formControl = useChakraFormControlContext() || {};
    var invalid = isInvalid !== null && isInvalid !== void 0 ? isInvalid : formControl.isInvalid;
    var themeStyles = useMultiStyleConfig("FileInput", {
        variant: props.variant,
        isDragging: isDragging,
        isDisabled: isDisabled,
        isInvalid: invalid
    });
    var styles = React.useMemo(function () { return _merge(themeStyles, sx); }, [themeStyles, sx]);
    var handleUploadFile = function () {
        var _a;
        if (isDisabled)
            return;
        (_a = inputFileRef.current) === null || _a === void 0 ? void 0 : _a.click();
    };
    var handleChangeFile = function (ev) {
        var _a, _b;
        if (ev && ev.target && ev.target.files) {
            var file = (_a = ev === null || ev === void 0 ? void 0 : ev.target) === null || _a === void 0 ? void 0 : _a.files[0];
            onChange && onChange(file);
            (_b = fileRef.current) === null || _b === void 0 ? void 0 : _b.blur();
        }
    };
    var handleDragOver = function (event) {
        event.preventDefault();
        setIsDragging(true);
    };
    var handleDragLeave = function () {
        setIsDragging(false);
    };
    var handleDrop = function (event) {
        if (isDisabled)
            return;
        event.preventDefault();
        var file = event.dataTransfer.files[0];
        setIsDragging(false);
        onChange && onChange(file);
    };
    return (React.createElement(ChakraCenter, __assign({ "data-testid": "input-file", ref: ref || fileRef, onClick: handleUploadFile, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, tabIndex: 1, sx: styles.container }, props),
        React.createElement(PhosphorIcon, { as: CloudArrowDown, size: "sm", sx: styles.icon }),
        React.createElement(ChakraInput, { type: "file", ref: inputFileRef, isInvalid: invalid, onChange: function (ev) { return handleChangeFile(ev); }, display: "none", accept: Object.values(acceptedFileTypes || {}).join(",") }),
        React.createElement(Text, { sx: styles.label }, label || "Click to browse or drag here your files."),
        React.createElement(Text, { sx: styles.description }, description || "Maximum file size 50MB")));
});
