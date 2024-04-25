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
import React from "react";
import { Button, Flex } from "@chakra-ui/react";
import { Tooltip } from "./Tooltip";
import { Info } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
var meta = {
    title: "Design System/Overlay/Tooltip",
    component: Tooltip,
    argTypes: {
        placement: {
            description: "Tooltip placement",
            options: [
                "auto-start",
                "auto",
                "auto-end",
                "top-start",
                "top",
                "top-end",
                "right-start",
                "right",
                "right-end",
                "bottom-start",
                "bottom",
                "bottom-end",
                "left-start",
                "left",
                "left-end",
            ],
            control: {
                type: "select"
            }
        },
        hasArrow: {
            description: "Tooltip with arrow",
            options: [true, false],
            control: {
                type: "select"
            }
        },
        label: {
            description: "Tooltip label",
            defaultValue: "tooltip",
            control: {
                type: "object"
            }
        },
        variant: {
            description: "Variant",
            options: ["light", "dark"],
            control: {
                type: "select"
            }
        },
        children: {
            control: {
                type: null
            }
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A6678"
        }
    },
    args: {
        trigger: "hover",
        children: React.createElement(Button, null, "hover me!"),
        label: "Here’s a regular tooltip with some text inside of it that’s supposed to be substantially large."
    }
};
export default meta;
var Template = function (_a) {
    var label = _a.label, args = __rest(_a, ["label"]);
    return (React.createElement(Flex, { align: "center", pos: "relative", maxW: "10px" },
        React.createElement(Tooltip, __assign({ label: label }, args))));
};
export var HoverText = Template.bind({});
HoverText.args = {
    placement: "top"
};
export var HoverIcon = Template.bind({});
HoverIcon.args = {
    children: React.createElement(PhosphorIcon, { as: Info, size: "small", p: "2px" })
};
export var CenterTop = Template.bind({});
CenterTop.args = {
    placement: "top",
    label: "Here's a short tooltip"
};
export var LeftTop = Template.bind({});
LeftTop.args = {
    placement: "top-start",
    label: "Here's a short tooltip"
};
export var RightTop = Template.bind({});
RightTop.args = {
    placement: "top-end",
    label: "Here's a short tooltip"
};
export var CenterBottom = Template.bind({});
CenterBottom.args = {
    placement: "bottom",
    label: "Here's a short tooltip"
};
export var LeftBottom = Template.bind({});
LeftBottom.args = {
    placement: "bottom-start",
    label: "Here's a short tooltip"
};
export var RightBottom = Template.bind({});
RightBottom.args = {
    placement: "bottom-end",
    label: "Here's a short tooltip"
};
export var Left = Template.bind({});
Left.args = {
    placement: "left",
    label: "Here's a short tooltip"
};
export var Right = Template.bind({});
Right.args = {
    placement: "right",
    label: "Here's a short tooltip"
};
