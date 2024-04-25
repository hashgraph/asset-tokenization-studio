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
import { PanelTitle } from "@Components/DataDisplay/PanelTitle";
var props = {
    title: "Panel Title"
};
export default {
    title: "Design System/Data Display/PanelTitle",
    component: PanelTitle,
    args: {},
    parameters: {
        docs: {}
    }
};
var Template = function (args) { return React.createElement(PanelTitle, __assign({}, args)); };
export var PanelTitleWithBorderBottom = Template.bind({});
PanelTitleWithBorderBottom.args = __assign({}, props);
