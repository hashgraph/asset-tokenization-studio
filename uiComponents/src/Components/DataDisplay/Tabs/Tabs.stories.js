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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React from "react";
import { Tabs } from "./Tabs";
var tabs = __spreadArray([], Array(5), true).map(function (_el, index) { return ({
    header: "Tab ".concat(index + 1),
    content: "Tab ".concat(index + 1, " Content ")
}); });
var meta = {
    title: "Design System/Data Display/Tabs",
    component: Tabs,
    argTypes: {
        tabs: {
            description: "Tabs object list.",
            table: {
                type: {
                    summary: "TabProps[]",
                    detail: "\n            TabProps extends ChakraTabProps {\n            header: string | ReactNode;\n            content: string | ReactNode;\n          }"
                }
            },
            control: {
                type: "object"
            }
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A7922"
        }
    },
    args: {
        tabs: tabs
    }
};
export default meta;
var Template = function (args) { return React.createElement(Tabs, __assign({}, args)); };
export var Default = Template.bind({});
Default.args = {};
export var TableTabs = Template.bind({});
TableTabs.args = {
    variant: "table"
};
