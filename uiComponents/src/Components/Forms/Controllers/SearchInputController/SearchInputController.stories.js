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
import { SearchInputController } from "./SearchInputController";
import { useForm } from "react-hook-form";
var meta = {
    title: "Design System/Forms/Controllers/SearchInputController",
    component: SearchInputController,
    args: {
        id: "search",
        label: "Label",
        placeholder: "Placeholder",
        onSearch: function (value) { return console.log("Searching... ".concat(value)); }
    },
    argTypes: {},
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    var form = useForm({ mode: "onChange" });
    return React.createElement(SearchInputController, __assign({}, args, { control: form.control }));
};
export var Default = Template.bind({});
export var MinInputSearchCustom = Template.bind({});
MinInputSearchCustom.args = {
    placeholder: "Introduce 5 chars to search",
    minSearchLength: 5
};
