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
import { Plus, DotsThree } from "@phosphor-icons/react";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { Button } from "./Button";
import { allButtonVariants, iconLabels, iconList, mappedIcons, allSizes, buttonStatus, } from "@/storiesUtils";
var commonArgs = {
    children: "Button",
    variant: "primary",
    size: "lg"
};
var commonArgsTypes = {
    isDisabled: {
        control: {
            type: "boolean"
        },
        description: "If it is true, the button will be shown as deactivated and cannot be interacted with it. This is a good option to indicate to the user that he cannot perform some action at that time."
    },
    onClick: {
        action: "onClick",
        description: "The function to be called when the button is clicked"
    },
    variant: {
        options: allButtonVariants,
        control: {
            type: "radio"
        },
        description: "Define the visual style of the button. The available options are `Primary`, `Secondary`, `Danger` and `Tertiary`. This is useful when you want to use different buttons styles for different actions."
    },
    size: {
        options: allSizes,
        control: { type: "radio" },
        description: "Define the size of the button. The available options are `md` and `lg`. This can be useful when you want to use different buttons sizes for different devices or for different areas of the user interface where larger or smaller buttons are desired."
    },
    isLoading: {
        control: "boolean",
        description: "Toggle to put the button in loading state"
    }
};
var commonArgsWithIcons = __assign(__assign({}, commonArgs), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), rightIcon: React.createElement(PhosphorIcon, { as: DotsThree }) });
var commonArgsTypesWithIcons = __assign(__assign({}, commonArgsTypes), { leftIcon: {
        options: iconList,
        control: {
            type: "select",
            labels: iconLabels,
            mapping: mappedIcons,
            required: false
        },
        mapping: mappedIcons,
        description: "Icon to be displayed on the left side of the button"
    }, rightIcon: {
        options: iconList,
        control: {
            type: "select",
            labels: iconLabels,
            mapping: mappedIcons,
            required: false
        },
        mapping: mappedIcons,
        description: "Icon to be displayed on the right side of the button"
    } });
var meta = {
    title: "Design System/Interaction/Button",
    component: Button,
    argTypes: __assign(__assign({}, commonArgsTypes), { status: {
            options: buttonStatus,
            control: { type: "select" }
        } }),
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A23012&t=uLoNHekrc4UjtgwE-0"
        }
    }
};
export default meta;
var Template = function (args) { return React.createElement(Button, __assign({}, args)); };
// Primary
export var Primary = Template.bind({});
Primary.args = __assign({}, commonArgs);
Primary.argTypes = __assign({}, commonArgsTypes);
export var PrimaryWithIcon = Template.bind({});
PrimaryWithIcon.argTypes = __assign({}, commonArgsTypesWithIcons);
PrimaryWithIcon.args = __assign(__assign({}, commonArgsWithIcons), { variant: "primary" });
export var PrimaryWithLoading = Template.bind({});
PrimaryWithLoading.argTypes = __assign({}, commonArgsTypes);
PrimaryWithLoading.args = __assign(__assign({}, commonArgs), { variant: "primary", isLoading: true, loadingText: "Loading" });
export var PrimaryDisabled = Template.bind({});
PrimaryDisabled.argTypes = __assign({}, commonArgsTypes);
PrimaryDisabled.args = __assign(__assign({}, commonArgs), { variant: "primary", isDisabled: true });
// Secondary
export var Secondary = Template.bind({});
Secondary.args = __assign(__assign({}, commonArgs), { variant: "secondary" });
Secondary.argTypes = __assign({}, commonArgsTypes);
export var SecondaryWithIcon = Template.bind({});
SecondaryWithIcon.argTypes = __assign({}, commonArgsTypesWithIcons);
SecondaryWithIcon.args = __assign(__assign({}, commonArgsWithIcons), { variant: "secondary" });
export var SecondaryWithLoading = Template.bind({});
SecondaryWithLoading.args = __assign(__assign({}, commonArgs), { variant: "secondary", isLoading: true, loadingText: "Loading" });
SecondaryWithLoading.argTypes = __assign({}, commonArgsTypes);
export var SecondaryDisabled = Template.bind({});
SecondaryDisabled.args = __assign(__assign({}, commonArgs), { variant: "secondary", isDisabled: true });
SecondaryDisabled.argTypes = __assign({}, commonArgsTypes);
// Tertiary
export var Tertiary = Template.bind({});
Tertiary.args = __assign(__assign({}, commonArgs), { variant: "tertiary" });
Tertiary.argTypes = __assign({}, commonArgsTypes);
export var TertiaryWithLoading = Template.bind({});
TertiaryWithLoading.args = __assign(__assign({}, commonArgs), { variant: "tertiary", isLoading: true, loadingText: "Loading" });
TertiaryWithLoading.argTypes = __assign({}, commonArgsTypes);
export var TertiaryDisabled = Template.bind({});
TertiaryDisabled.args = __assign(__assign({}, commonArgs), { variant: "tertiary", isDisabled: true });
TertiaryDisabled.argTypes = __assign({}, commonArgsTypes);
export var TertiaryWithIcon = Template.bind({});
TertiaryWithIcon.argTypes = __assign({}, commonArgsTypesWithIcons);
TertiaryWithIcon.args = __assign(__assign({}, commonArgsWithIcons), { variant: "tertiary" });
// Danger
export var Danger = Template.bind({});
Danger.args = __assign(__assign({}, commonArgs), { variant: "primary", status: "error" });
Danger.argTypes = __assign({}, commonArgsTypes);
export var DangerWithLoading = Template.bind({});
DangerWithLoading.args = __assign(__assign({}, commonArgs), { variant: "primary", status: "error", isLoading: true, loadingText: "Loading" });
DangerWithLoading.argTypes = __assign({}, commonArgsTypes);
export var DangerDisabled = Template.bind({});
DangerDisabled.args = __assign(__assign({}, commonArgs), { variant: "primary", status: "error", isDisabled: true });
DangerDisabled.argTypes = __assign({}, commonArgsTypes);
export var DangerWithIcon = Template.bind({});
DangerWithIcon.argTypes = __assign({}, commonArgsTypesWithIcons);
DangerWithIcon.args = __assign(__assign({}, commonArgsWithIcons), { variant: "primary", status: "error" });
