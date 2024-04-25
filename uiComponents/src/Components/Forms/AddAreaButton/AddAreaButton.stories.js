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
import { Flex } from "@chakra-ui/react";
import React from "react";
import { AddAreaButton } from "./AddAreaButton";
var meta = {
    title: "Design System/Forms/AddArea",
    component: AddAreaButton,
    args: {
        containerWidth: "472px",
        children: "Add elements text",
        onClick: function () { return console.log("Click on Add area button"); }
    },
    argTypes: {
        isDisabled: { control: { type: "boolean" } }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/ioBricks-Design-System?type=design&node-id=3635-63030&t=s4x0jqVtY37T19Tn-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (_a) {
    var containerWidth = _a.containerWidth, args = __rest(_a, ["containerWidth"]);
    return (React.createElement(Flex, { w: containerWidth },
        React.createElement(AddAreaButton, __assign({}, args))));
};
export var Default = Template.bind({});
Default.args = {};
