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
import { Tag } from "./Tag";
import { Plus, DotsThreeOutline } from "@phosphor-icons/react";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { iconList, mappedIcons } from "@/storiesUtils";
var commonProps = {
    label: "Tag text"
};
var meta = {
    title: "Design System/Data Display/Tag",
    component: Tag,
    argTypes: {
        disabled: {
            description: "Whether the tag is disabled",
            control: { type: "boolean" }
        },
        size: {
            description: "The size of the tag",
            options: ["sm", "lg"],
            control: { type: "radio" }
        },
        leftIcon: {
            description: "The icon to display on the left side of the tag",
            options: iconList,
            mapping: mappedIcons,
            control: {
                type: "select"
            }
        },
        rightIcon: {
            description: "The icon to display on the right side of the tag",
            options: iconList,
            mapping: mappedIcons,
            control: {
                type: "select"
            }
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1541%3A28955"
        },
        docs: {}
    },
    args: {}
};
export default meta;
var Template = function (args) {
    return React.createElement(Tag, __assign({}, args));
};
export var NoIconsSmall = Template.bind({});
NoIconsSmall.args = __assign(__assign({}, commonProps), { size: "md" });
export var NoIconsLarge = Template.bind({});
NoIconsLarge.args = __assign(__assign({}, commonProps), { size: "lg" });
export var NoIconsDisabledSmall = Template.bind({});
NoIconsDisabledSmall.args = __assign(__assign({}, commonProps), { disabled: true, size: "md" });
export var NoIconsDisabledLarge = Template.bind({});
NoIconsDisabledLarge.args = __assign(__assign({}, commonProps), { disabled: true, size: "lg" });
export var LeftIconSmall = Template.bind({});
LeftIconSmall.args = __assign(__assign({}, commonProps), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), size: "md" });
export var LeftIconLarge = Template.bind({});
LeftIconLarge.args = __assign(__assign({}, commonProps), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), size: "lg" });
export var LeftIconDisabledSmall = Template.bind({});
LeftIconDisabledSmall.args = __assign(__assign({}, commonProps), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), disabled: true, size: "md" });
export var LeftIconDisabledLarge = Template.bind({});
LeftIconDisabledLarge.args = __assign(__assign({}, commonProps), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), disabled: true, size: "lg" });
export var RightIconSmall = Template.bind({});
RightIconSmall.args = __assign(__assign({}, commonProps), { rightIcon: React.createElement(PhosphorIcon, { as: DotsThreeOutline }), size: "md" });
export var RightIconLarge = Template.bind({});
RightIconLarge.args = __assign(__assign({}, commonProps), { rightIcon: React.createElement(PhosphorIcon, { as: DotsThreeOutline }), size: "lg" });
export var RightIconDisabledSmall = Template.bind({});
RightIconDisabledSmall.args = __assign(__assign({}, commonProps), { rightIcon: React.createElement(PhosphorIcon, { as: DotsThreeOutline }), disabled: true, size: "md" });
export var RightIconDisabledLarge = Template.bind({});
RightIconDisabledLarge.args = __assign(__assign({}, commonProps), { rightIcon: React.createElement(PhosphorIcon, { as: DotsThreeOutline }), disabled: true, size: "lg" });
export var BothIconsSmall = Template.bind({});
BothIconsSmall.args = __assign(__assign({}, commonProps), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), rightIcon: React.createElement(PhosphorIcon, { as: DotsThreeOutline }), size: "md" });
export var BothIconsLarge = Template.bind({});
BothIconsLarge.args = __assign(__assign({}, commonProps), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), rightIcon: React.createElement(PhosphorIcon, { as: DotsThreeOutline }), size: "lg" });
export var BothIconsDisabledSmall = Template.bind({});
BothIconsDisabledSmall.args = __assign(__assign({}, commonProps), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), rightIcon: React.createElement(PhosphorIcon, { as: DotsThreeOutline }), disabled: true, size: "md" });
export var BothIconsDisabledLarge = Template.bind({});
BothIconsDisabledLarge.args = __assign(__assign({}, commonProps), { leftIcon: React.createElement(PhosphorIcon, { as: Plus }), rightIcon: React.createElement(PhosphorIcon, { as: DotsThreeOutline }), disabled: true, size: "lg" });
export var JustIconSmall = Template.bind({});
JustIconSmall.args = {
    icon: React.createElement(PhosphorIcon, { as: Plus }),
    size: "md"
};
export var JustIconLarge = Template.bind({});
JustIconLarge.args = {
    icon: React.createElement(PhosphorIcon, { as: Plus }),
    size: "lg"
};
export var JustIconDisabledSmall = Template.bind({});
JustIconDisabledSmall.args = {
    icon: React.createElement(PhosphorIcon, { as: Plus }),
    size: "md",
    disabled: true
};
export var JustIconDisabledLarge = Template.bind({});
JustIconDisabledLarge.args = {
    icon: React.createElement(PhosphorIcon, { as: Plus }),
    disabled: true,
    size: "lg"
};
export var WithIsLoading = Template.bind({});
WithIsLoading.args = __assign(__assign({}, commonProps), { isLoading: true });
