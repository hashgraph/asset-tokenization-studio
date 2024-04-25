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
import { Wizard } from "./Wizard";
import { useStepContext, useSteps } from "@Components/Indicators/Stepper";
import { Button } from "@Components/Interaction/Button";
import { Flex } from "@chakra-ui/react";
var Step = function (_a) {
    var title = _a.title;
    var step = useStepContext();
    return (React.createElement(React.Fragment, null,
        React.createElement("div", null, title),
        React.createElement(Flex, { gap: 2 },
            React.createElement(Button, { isDisabled: step.isFirst, onClick: step.goToPrevious }, "prev"),
            React.createElement(Button, { isDisabled: step.isLast, onClick: step.goToNext }, "next"))));
};
var stepsData = [
    {
        title: "First",
        description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        content: React.createElement(Step, { title: "First" })
    },
    {
        title: "Second",
        description: "Contact Info ",
        content: React.createElement(Step, { title: "second" })
    },
    {
        title: "Third",
        description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        content: React.createElement(Step, { title: "third" })
    },
    {
        title: "Four",
        description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        content: React.createElement(Step, { title: "four" })
    },
    {
        title: "five",
        description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        content: React.createElement(Step, { title: "five" })
    },
    {
        title: "six",
        description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        content: React.createElement(Step, { title: "six" })
    },
];
export default {
    title: "Design System/Indicators/Wizard",
    component: Wizard,
    args: {
        steps: stepsData
    }
};
var Template = function (args) {
    var steps = useSteps();
    return React.createElement(Wizard, __assign({}, steps, stepsData, args));
};
export var Default = Template.bind({});
