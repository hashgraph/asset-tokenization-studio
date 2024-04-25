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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { FileInput } from "@Components/Forms/FileInput";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import React, { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { FileCard } from "@Components/DataDisplay/FileCard";
export var FileInputController = function (_a) {
    var control = _a.control, id = _a.id, variant = _a.variant, showErrors = _a.showErrors, onChange = _a.onChange, props = __rest(_a, ["control", "id", "variant", "showErrors", "onChange"]);
    var _b = useController({
        name: id,
        control: control
    }), fieldState = _b.fieldState, onChangeDefault = _b.field.onChange;
    var _c = useState([]), files = _c[0], setFiles = _c[1];
    var handleOnChangeFile = function (file) {
        var updatedFiles = __spreadArray(__spreadArray([], files, true), [file], false);
        setFiles(updatedFiles);
        onChange && onChange(file);
        onChangeDefault(updatedFiles);
    };
    var handleRemoveFile = function (index) {
        var updatedFiles = files.filter(function (_, indexItem) { return index !== indexItem; });
        onChangeDefault(updatedFiles);
        setFiles(updatedFiles);
    };
    return (React.createElement(Flex, { flexDir: "column", gap: 4 },
        React.createElement(FieldController, { fieldState: fieldState, showErrors: showErrors, errorMessageVariant: variant },
            React.createElement(FileInput, __assign({ "data-testid": id, isInvalid: !!fieldState.error, onChange: handleOnChangeFile }, props))),
        files.map(function (file, index) {
            return (React.createElement(FileCard, { key: index, file: file, onRemove: function () { return handleRemoveFile(index); } }));
        })));
};
