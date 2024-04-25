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
import { useForm } from "react-hook-form";
import { CheckboxGroupController } from "./CheckboxGroupController";
var meta = {
    title: "Design System/Forms/Controllers/CheckboxGroupController",
    component: CheckboxGroupController,
    args: {
        id: "Name"
    },
    argTypes: {},
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    var form = useForm({ mode: "onChange" });
    return (React.createElement(CheckboxGroupController, __assign({}, args, { control: form.control, id: "field", options: [
            { label: "value 1", value: "value1" },
            { label: "value 2", value: "value2" },
            { label: "value 3", value: "value3" },
        ] })));
};
export var Default = Template.bind({});
Default.args = {};
