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
import { Box, Text, VStack, useColorModeValue, Grid, GridItem, Center, } from "@chakra-ui/react";
import React from "react";
import { Button } from "@Components/Interaction/Button";
import { useToast } from "./useToast";
var positions = [
    "top-left",
    "top",
    "top-right",
    "bottom-right",
    "bottom",
    "bottom-left",
];
export var DemoToast = function (props) {
    var toastIdRef = React.useRef();
    var toast = useToast();
    function addToast(params) {
        toastIdRef.current = toast.show(__assign(__assign({}, props), params));
    }
    function addAnotherToast(position) {
        toastIdRef.current = toast.show(__assign(__assign({}, props), { position: position, render: function (renderProps) { return (React.createElement(Card, __assign({}, props, { status: "success", onClose: function () {
                    toast.close(renderProps.id);
                } }))); } }));
    }
    function close() {
        if (props.isClosable && toastIdRef.current) {
            toast.close(toastIdRef.current);
        }
    }
    function closeAll() {
        if (props.isClosable) {
            toast.closeAll();
        }
    }
    return (React.createElement(Grid, { templateColumns: "repeat(7, 1fr)", gap: 4, padding: 5 },
        React.createElement(GridItem, null),
        positions.map(function (position) { return (React.createElement(GridItem, null,
            React.createElement(Text, null, position))); }),
        React.createElement(GridItem, null,
            React.createElement(Text, null, "Error")),
        positions.map(function (position) { return (React.createElement(GridItem, null,
            React.createElement(Button, { width: "90%", variant: "primary", status: "error", onClick: function () {
                    return addToast(__assign(__assign({}, props), { status: "error", position: position }));
                } },
                "Show error (",
                position,
                ")"))); }),
        React.createElement(GridItem, null,
            React.createElement(Text, null, "Info")),
        positions.map(function (position) { return (React.createElement(GridItem, null,
            React.createElement(Button, { width: "90%", variant: "secondary", onClick: function () {
                    return addToast(__assign(__assign({}, props), { status: "info", position: position }));
                } },
                "Show info (",
                position,
                ")"))); }),
        React.createElement(GridItem, null,
            React.createElement(Text, null, "Success")),
        positions.map(function (position) { return (React.createElement(GridItem, null,
            React.createElement(Button, { width: "90%", variant: "primary", onClick: function () {
                    return addToast(__assign(__assign({}, props), { status: "success", position: position }));
                } },
                "Show success (",
                position,
                ")"))); }),
        React.createElement(GridItem, null,
            React.createElement(Text, null, "Warning")),
        positions.map(function (position) { return (React.createElement(GridItem, null,
            React.createElement(Button, { width: "90%", variant: "primary", status: "warning", onClick: function () {
                    return addToast(__assign(__assign({}, props), { status: "warning", position: position }));
                } },
                "Show warning (",
                position,
                ")"))); }),
        React.createElement(GridItem, null,
            React.createElement(Text, null, "Loading")),
        positions.map(function (position) { return (React.createElement(GridItem, null,
            React.createElement(Button, { width: "90%", variant: "secondary", onClick: function () {
                    return addToast(__assign(__assign({}, props), { status: "loading", position: position }));
                } },
                "Show loading (",
                position,
                ")"))); }),
        React.createElement(GridItem, null,
            React.createElement(Text, null, "Custom")),
        positions.map(function (position) { return (React.createElement(GridItem, null,
            React.createElement(Button, { width: "90%", variant: "tertiary", onClick: function () { return addAnotherToast(position); } },
                "Show Custom (",
                position,
                ")"))); }),
        React.createElement(Button, { width: 40, variant: "outline", color: "teal", onClick: close }, "Close latest"),
        React.createElement(Button, { width: 40, variant: "outline", color: "teal", onClick: closeAll }, "Close all")));
};
function CardWrapper(_a) {
    var children = _a.children;
    return (React.createElement(Box, { mb: 4, shadow: "base", borderWidth: "1px", alignSelf: { base: "center", lg: "flex-start" }, borderColor: useColorModeValue("neutral.200", "neutral.500"), borderRadius: "xl" }, children));
}
function Card(_a) {
    var status = _a.status, onClose = _a.onClose, _b = _a.description, description = _b === void 0 ? "Lorem ipsum dolor sit amet, consectetur adipisicing elit." : _b, title = _a.title, _c = _a.isClosable, isClosable = _c === void 0 ? true : _c;
    return (React.createElement(CardWrapper, null,
        React.createElement(Center, { py: 4, px: 12, flexDirection: "column", backgroundColor: useColorModeValue("neutral", "neutral.700"), borderTop: "solid 3px", borderTopColor: useColorModeValue("".concat(status, ".500"), "".concat(status, ".200")) },
            React.createElement(Text, { mb: 5, fontWeight: "700", fontSize: "3xl" }, title),
            React.createElement(Text, { fontWeight: "500", fontSize: "2xl" }, description)),
        React.createElement(VStack, { bg: useColorModeValue("neutral.50", "neutral.700"), py: 4, borderBottomRadius: "xl" },
            React.createElement(Box, { w: "80%", pt: 7 },
                React.createElement(Button, { width: 15, onClick: isClosable ? onClose : undefined, w: "full", variant: "primary", status: status }, "Close")))));
}
var meta = {
    title: "Design System/Overlay/Toast",
    component: DemoToast,
    argTypes: {
        title: {
            control: { type: "text", required: true },
            description: "A required string that indicates the title of the Toast, which is displayed at the top of the Toast."
        },
        status: {
            options: ["info", "warning", "error", "success"],
            control: { type: "select", required: true },
            description: "A required string that indicates the status of the Toast, which determines the visual style to be used."
        },
        description: {
            control: { type: "text" },
            description: "A required string that indicates the title of the Toast, which is displayed at the top of the Toast."
        },
        variant: {
            options: ["subtle", "solid", "leftAccent", "topAccent"],
            control: { type: "select" },
            description: "Determines the style of the toast"
        },
        isClosable: {
            control: { type: "boolean" },
            description: "Determines if the toast is closable",
            defaultValue: false
        },
        onClose: {
            description: "An optional function that will be called when the Toast is closed."
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10080"
        }
    },
    args: {
        description: "This is a description",
        title: "Title",
        variant: "subtle",
        onClose: undefined,
        isClosable: true
    }
};
export default meta;
var Template = function (args) { return React.createElement(DemoToast, __assign({}, args)); };
export var Line = Template.bind({});
Line.args = {
    variant: "subtle"
};
