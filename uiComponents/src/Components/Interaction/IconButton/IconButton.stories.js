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
import { buttonStatus, iconButtonSizes, iconButtonVariants, iconList, mappedIcons, } from "@/storiesUtils";
import { IconButton } from "./IconButton";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
var commonVariantArgs = {
    icon: React.createElement(PhosphorIcon, { as: Plus })
};
var meta = {
    title: "Design System/Interaction/IconButton",
    component: IconButton,
    argTypes: {
        isDisabled: {
            control: {
                type: "boolean"
            },
            description: "If it is true, the button will be shown as deactivated and cannot be interacted with it. This is a good option to indicate to the user that he cannot perform some action at that time."
        },
        variant: {
            options: iconButtonVariants,
            control: "select",
            description: "Define the visual style of the button. The available options are `Primary`, `Secondary`, `Danger` and `Tertiary`. This is useful when you want to use different buttons styles for different actions."
        },
        size: {
            options: iconButtonSizes,
            control: "select",
            description: "Define the size of the button. The available options are `XS`, `SM`, `MD`, `LG` and `XL`. This can be useful when you want to use different buttons sizes for different devices or for different areas of the user interface where larger or smaller buttons are desired."
        },
        icon: {
            options: iconList,
            control: {
                type: "select"
            },
            mapping: mappedIcons,
            description: "Define the icon that will be rendered inside the button",
            defaultValue: Plus
        },
        onClick: { action: "onClick" },
        isLoading: {
            control: "boolean",
            description: "Toggle to put the button in loading state"
        },
        status: {
            options: buttonStatus,
            control: "select"
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A7966"
        },
        docs: {}
    },
    args: {
        icon: React.createElement(PhosphorIcon, { as: ArrowRight })
    }
};
export default meta;
var Template = function (args) { return React.createElement(IconButton, __assign({}, args)); };
export var ExtraSmall = Template.bind({});
ExtraSmall.args = __assign(__assign({}, commonVariantArgs), { size: "xs" });
export var Small = Template.bind({});
Small.args = __assign(__assign({}, commonVariantArgs), { size: "sm" });
export var Medium = Template.bind({});
Medium.args = __assign(__assign({}, commonVariantArgs), { size: "md" });
export var Primary = Template.bind({});
Primary.args = __assign(__assign({}, commonVariantArgs), { variant: "primary", size: "md" });
export var PrimaryDisabled = Template.bind({});
PrimaryDisabled.args = __assign(__assign({}, commonVariantArgs), { variant: "primary", size: "md", isDisabled: true });
export var Secondary = Template.bind({});
Secondary.args = __assign(__assign({}, commonVariantArgs), { variant: "secondary", size: "md" });
export var SecondaryDisabled = Template.bind({});
SecondaryDisabled.args = __assign(__assign({}, commonVariantArgs), { variant: "secondary", size: "md", isDisabled: true });
export var Tertiary = Template.bind({});
Tertiary.args = __assign(__assign({}, commonVariantArgs), { variant: "tertiary", size: "md" });
export var TertiaryDisabled = Template.bind({});
TertiaryDisabled.args = __assign(__assign({}, commonVariantArgs), { variant: "tertiary", size: "md", isDisabled: true });
