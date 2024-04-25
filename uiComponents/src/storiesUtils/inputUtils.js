import { InputIcon, InputIconButton } from "@Components/Forms/Input";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Envelope, HouseLine, PlayCircle } from "@phosphor-icons/react";
import React from "react";
var onClick = function () { return console.log("Clicked!"); };
export var addonRightInput = {
    TwoButtonIcon: (React.createElement(React.Fragment, null,
        React.createElement(InputIconButton, { icon: React.createElement(PhosphorIcon, { as: HouseLine }), "aria-label": "Bluetooth", onClick: onClick }),
        React.createElement(InputIconButton, { "aria-label": "Bluetooth", icon: React.createElement(PhosphorIcon, { as: HouseLine }), onClick: onClick }))),
    OneButtonIcon: (React.createElement(InputIconButton, { "aria-label": "Bluetooth", onClick: onClick, icon: React.createElement(PhosphorIcon, { as: HouseLine }) })),
    OneIcon: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: HouseLine }) }),
    TwoIcon: (React.createElement(React.Fragment, null,
        React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: HouseLine }) }),
        React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: HouseLine }) }))),
    OneIconOneButton: (React.createElement(React.Fragment, null,
        React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: HouseLine }) }),
        React.createElement(InputIconButton, { "aria-label": "Bluetooth", onClick: onClick, icon: React.createElement(PhosphorIcon, { as: HouseLine }) })))
};
export var addonLeftInput = {
    Example1: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: PlayCircle }) }),
    Example2: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Envelope }) })
};
export var inputSizes = ["sm", "md", "lg"];
export var inputArgTypes = {
    size: {
        options: inputSizes,
        control: { type: "select" },
        description: "Size of the input. Must be defined in the theme"
    },
    addonRight: {
        options: Object.keys(addonRightInput),
        mapping: addonRightInput,
        control: {
            type: "select",
            labels: {
                OneButtonIcon: "One button",
                OneIcon: "One Icon",
                TwoIcon: "Two Icons",
                TwoButtonIcon: "Two buttons",
                OneIconOneButton: "One Icon & One IconButton"
            }
        },
        description: "Addon at the right of the input"
    },
    addonLeft: {
        options: Object.keys(addonLeftInput),
        mapping: addonLeftInput,
        control: {
            type: "select",
            labels: {
                Example1: "Example One",
                Example2: "Example Two"
            }
        },
        description: "Addon at the right of the input"
    },
    variant: {
        options: ["outline"],
        control: { type: "radio" },
        description: "Variant of the input. Must be defined in the theme."
    },
    showRequired: {
        control: { type: "boolean" },
        description: "Boolean that toggles whether to show the * if it is required."
    },
    isRequired: {
        control: { type: "boolean" },
        description: "Boolean to specify that the input is required."
    },
    isDisabled: {
        control: { type: "boolean" },
        description: "Boolean to specify if the input is disabled."
    },
    isInvalid: {
        control: { type: "boolean" },
        description: "Boolean to specify if the input is invalid."
    },
    isSuccess: {
        control: { type: "boolean" },
        description: "Boolean to specify that the input is success and valid."
    },
    placeholder: {
        description: "Placeholder of the input."
    },
    label: {
        description: "Label of the input."
    }
};
