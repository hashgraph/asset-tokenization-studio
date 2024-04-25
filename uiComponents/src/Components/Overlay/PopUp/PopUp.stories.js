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
import { Button } from "@Components/Interaction/Button";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { Tag } from "../../DataDisplay";
import { Clock } from "@phosphor-icons/react";
import { PopUp, PopUpIcon, PopUpText, ConfirmationPopUp } from "./index";
import { useDisclosure, Flex } from "@chakra-ui/react";
import { iconList, iconLabels, mappedIcons } from "@/storiesUtils";
var Children = function () { return (React.createElement(React.Fragment, null,
    React.createElement(PopUpText, { type: "title", label: "Title" }),
    React.createElement(Tag, { label: "Custom content" }))); };
var meta = {
    title: "Design System/Overlay/Popup",
    template: PopUp,
    argTypes: {
        isOpen: {
            control: {
                type: "boolean"
            },
            description: "Toggle to show or hide the popup"
        },
        showOverlay: {
            control: {
                type: "boolean"
            }
        },
        showCloseButton: {
            control: {
                type: "boolean"
            }
        },
        title: {
            description: "Title of the popup",
            control: {
                type: "text"
            }
        },
        description: {
            description: "Description of the popup",
            control: {
                type: "text"
            }
        },
        confirmText: {
            control: {
                type: "text"
            },
            description: "Text of the ok button"
        },
        cancelText: {
            description: "Text of the cancel button",
            control: {
                type: "text"
            }
        },
        size: {
            options: ["xs", "sm", "md", "lg", "xl", "full"],
            control: {
                type: "select",
                required: false
            },
            description: "Adjust the size of the popup"
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
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?type=design&node-id=2710-33931&t=yFrtXzBtXhWvNqLo-0"
        },
        docs: {}
    },
    args: {
        onCancel: undefined,
        onConfirm: undefined,
        showOverlay: true,
        showCloseButton: true,
        closeOnOverlayClick: true,
        title: "Title",
        description: "Here you can enter the pop up text if you need it. Introduce here the information the user needs to keep navigating through the platform.",
        size: "xs"
    }
};
var Template = function (_a) {
    var isOpenArgs = _a.isOpen, onCloseArgs = _a.onClose, onCancel = _a.onCancel, restArgs = __rest(_a, ["isOpen", "onClose", "onCancel"]);
    var _b = useDisclosure({
        onClose: function () {
            onCloseArgs === null || onCloseArgs === void 0 ? void 0 : onCloseArgs();
        }
    }), isOpen = _b.isOpen, onClose = _b.onClose, onOpen = _b.onOpen;
    var handleCancel = function () {
        onClose();
        onCancel === null || onCancel === void 0 ? void 0 : onCancel();
    };
    return (React.createElement(Flex, { flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh" },
        React.createElement(PopUp, __assign({}, restArgs, { isOpen: isOpen, onClose: onClose, onCancel: handleCancel })),
        React.createElement(Button, { onClick: onOpen }, "Open")));
};
var ConfirmationTemplate = function (_a) {
    var isOpenArgs = _a.isOpen, onCloseArgs = _a.onClose, onConfirmArgs = _a.onConfirm, onCancel = _a.onCancel, restArgs = __rest(_a, ["isOpen", "onClose", "onConfirm", "onCancel"]);
    var _b = useDisclosure({
        onClose: function () {
            onCloseArgs === null || onCloseArgs === void 0 ? void 0 : onCloseArgs();
        }
    }), isOpen = _b.isOpen, onClose = _b.onClose, onOpen = _b.onOpen;
    var handleCancel = function () {
        onClose();
        onCancel === null || onCancel === void 0 ? void 0 : onCancel();
    };
    var handleConfirm = function () {
        onConfirmArgs === null || onConfirmArgs === void 0 ? void 0 : onConfirmArgs();
        onClose();
    };
    return (React.createElement(Flex, { flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh" },
        React.createElement(ConfirmationPopUp, __assign({}, restArgs, { isOpen: isOpen, onClose: onClose, onCancel: handleCancel, onConfirm: handleConfirm })),
        React.createElement(Button, { onClick: onOpen }, "Open")));
};
export var Default = Template.bind({});
Default.args = {
    icon: React.createElement(PhosphorIcon, { as: Clock })
};
export var WithCustomContent = Template.bind({});
WithCustomContent.args = {
    children: React.createElement(Children, null)
};
export var WithOneButton = Template.bind({});
WithOneButton.args = {
    onConfirm: function () {
        alert("Ok");
    }
};
export var WithBothButtons = Template.bind({});
WithBothButtons.args = {
    onConfirm: function () {
        alert("Ok");
    },
    onCancel: function () {
        alert("Cancel");
    }
};
export var WithCustomOrganization = Template.bind({});
WithCustomOrganization.args = {
    children: (React.createElement(React.Fragment, null,
        React.createElement(PopUpText, { type: "description", label: "Description" }),
        React.createElement(PopUpText, { type: "title", label: "title" }),
        React.createElement(PopUpIcon, { icon: React.createElement(PhosphorIcon, { as: Clock }) })))
};
export var Confirmation = ConfirmationTemplate.bind({});
Confirmation.args = {
    confirmationText: "Confirm",
    onConfirm: function () {
        alert("Confirmed");
    }
};
export var ConfirmationWithCustomContent = ConfirmationTemplate.bind({});
ConfirmationWithCustomContent.args = {
    confirmationText: "Confirm",
    onConfirm: function () {
        alert("Confirmed");
    },
    children: React.createElement(Children, null)
};
export default meta;
