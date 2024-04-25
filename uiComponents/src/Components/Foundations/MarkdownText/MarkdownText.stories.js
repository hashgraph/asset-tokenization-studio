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
import { Heading } from "../Heading";
import { MarkdownText } from "./MarkdownText";
var meta = {
    title: "Design System/Foundations/MarkdownText",
    component: MarkdownText,
    argTypes: {},
    parameters: {
        docs: {}
    },
    args: {}
};
export default meta;
var Template = function (args) {
    return React.createElement(MarkdownText, __assign({}, args));
};
export var Default = Template.bind({});
Default.args = {
    children: "\n  #### H4 Heading\n  #### _H4 Heading Italic_\n  "
};
export var WithCustomTheme = Template.bind({});
WithCustomTheme.args = {
    children: "# h1 Heading 8-) \n  ## h2 Heading\n  ### h3 Heading\n  #### h4 Heading\n  ##### h5 Heading\n  ###### h6 Heading\n  ",
    theme: {
        h2: function (props) { return React.createElement(Heading, { color: "red" }, props.children); }
    }
};
