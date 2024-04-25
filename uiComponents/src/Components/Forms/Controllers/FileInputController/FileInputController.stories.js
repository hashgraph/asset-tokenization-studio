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
import { FileInputController } from "./FileInputController";
import React from "react";
import { useForm } from "react-hook-form";
var meta = {
    title: "Design System/Forms/Controllers/FileInputController",
    component: FileInputController,
    argTypes: {},
    args: {},
    parameters: {}
};
export default meta;
var Template = function (args) {
    var form = useForm({ mode: "onChange" });
    return (React.createElement(FileInputController, __assign({}, args, { id: "file", control: form.control, onChange: function (val) {
            console.log("onChange fired", val);
        } })));
};
export var Default = Template.bind({});
Default.args = {};
