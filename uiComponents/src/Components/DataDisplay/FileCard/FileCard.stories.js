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
import { FileCard } from "./FileCard";
import React from "react";
var meta = {
    title: "Design System/Data Display/FileCard",
    component: FileCard,
    argTypes: {
        isInvalid: {
            control: {
                type: "boolean"
            }
        }
    },
    args: {
        file: new File(["99999"], "filename.pdf", { type: "text/html" }),
        onRemove: function () { return alert("Button clicked!"); }
    },
    parameters: {}
};
export default meta;
var Template = function (args) { return React.createElement(FileCard, __assign({}, args)); };
export var Default = Template.bind({});
Default.args = {};
export var LongFileName = Template.bind({});
LongFileName.args = {
    file: new File(["99999"], "filename_Korem ipsum dolor sit amet, consectetur adipiscing elit.pdf", { type: "text/html" })
};
export var Invalid = Template.bind({});
Invalid.args = {
    isInvalid: true
};
export var WithIsLoading = Template.bind({});
WithIsLoading.args = {
    isLoading: true
};
