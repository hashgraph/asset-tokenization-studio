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
import { CardButton } from "./CardButton";
import React, { useState } from "react";
import { iconLabels, iconList, mappedIcons } from "@/storiesUtils";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Activity, Airplane, Circle, X } from "@phosphor-icons/react";
import { Center } from "@chakra-ui/react";
var meta = {
    title: "Design System/Interaction/CardButton",
    component: CardButton,
    argTypes: {
        text: {
            description: "Enter text of card button"
        },
        icon: {
            options: iconList,
            control: {
                type: "select",
                labels: iconLabels,
                required: false
            },
            mapping: mappedIcons,
            description: "Icon to be displayed on the left side of the button"
        }
    },
    args: {
        icon: React.createElement(PhosphorIcon, { as: Activity })
    }
};
export default meta;
var Template = function (args) {
    return (React.createElement(Center, null,
        React.createElement(CardButton, __assign({}, args))));
};
var TemplateGroup = function (args) {
    var _a = useState(0), cardSelected = _a[0], setCardSelected = _a[1];
    var options = [
        {
            text: "Card button 1",
            icon: React.createElement(PhosphorIcon, { as: Airplane })
        },
        {
            text: "Card button 2",
            icon: React.createElement(PhosphorIcon, { as: Circle })
        },
        {
            text: "Card button 3",
            icon: React.createElement(PhosphorIcon, { as: X })
        },
    ];
    return (React.createElement(Center, { gap: 4 }, options.map(function (item, index) {
        var isSelected = cardSelected === index;
        return (React.createElement(CardButton, __assign({ onClick: function () { return setCardSelected(index); }, isSelected: isSelected }, item)));
    })));
};
export var Default = Template.bind({});
Default.args = {
    text: "Button text"
};
export var WithLongText = Template.bind({});
WithLongText.args = {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
};
export var disabled = Template.bind({});
disabled.args = {
    text: "Button text",
    isDisabled: true
};
export var selected = Template.bind({});
selected.args = {
    text: "Button text",
    isSelected: true
};
export var group = TemplateGroup.bind({});
