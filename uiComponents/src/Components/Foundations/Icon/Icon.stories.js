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
import { icons } from "@/Theme/icons";
import React from "react";
import { Icon } from "./Icon";
import { UserRectangle } from "@phosphor-icons/react";
var CustomNameIcons = Object.keys(icons);
var meta = {
    title: "Design System/Foundations/Icon",
    component: Icon,
    argTypes: {
        name: {
            options: CustomNameIcons
        },
        size: {
            control: "select",
            options: ["sm", "md"]
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A7966"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    return React.createElement(Icon, __assign({}, args));
};
export var RemixIcon = Template.bind({});
RemixIcon.args = {
    as: UserRectangle
};
export var CustomIconStory = Template.bind({});
CustomIconStory.args = {
    name: "Progress"
};
CustomIconStory.argTypes = {
    name: {
        control: {
            type: "select",
            options: CustomNameIcons
        }
    }
};
