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
import { Horse } from "@phosphor-icons/react";
import React from "react";
import { PhosphorIcon, Weight } from "./PhosphorIcon";
var meta = {
    title: "Design System/Foundations/PhosphorIcon",
    component: PhosphorIcon,
    argTypes: {
        as: {
            description: "The icon from @phosphor-icons/react that we want to render",
            control: false
        },
        size: {
            control: {
                type: "select",
                options: ["xxs", "xs", "sm", "md"]
            },
            description: "The size of the PhosphorIcon. Must be defined in the theme"
        },
        variant: {
            control: { type: "select", options: ["success", "error"] },
            description: "The variant of the PhosphorIcon. Must be defined in the theme"
        },
        weight: {
            description: "The weight of the PhosphorIcon."
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
    return React.createElement(PhosphorIcon, __assign({}, args));
};
export var Default = Template.bind({});
Default.args = {
    as: Horse
};
export var Fill = Template.bind({});
Fill.args = {
    as: Horse,
    weight: Weight.Fill
};
