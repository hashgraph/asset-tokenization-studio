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
import { Stepper, Step } from "./index";
var defaultSteps = [
    {
        title: "First",
        description: "Contact Info"
    },
    { title: "Second", description: "Date & Time" },
    { title: "Third", description: "Select Rooms" },
];
var withoutDescriptionSteps = [
    { title: "First" },
    { title: "Second" },
    { title: "Third" },
];
var longTextSteps = [
    {
        title: "First title so long, lorem ipsum dolor sit amet",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
        title: "Second"
    },
    { title: "Third", description: "Date & Time" },
];
export default {
    title: "Design System/Indicators/Stepper",
    component: Stepper,
    args: {
        index: 1
    }
};
var Template = function (args) { return (React.createElement(Stepper, __assign({}, args), defaultSteps.map(function (step, index) { return (React.createElement(Step, __assign({ key: index }, step))); }))); };
export var Default = Template.bind({});
Default.args = {};
var WithoutDescriptionTemplate = function (args) { return (React.createElement(Stepper, __assign({}, args), withoutDescriptionSteps.map(function (step, index) { return (React.createElement(Step, __assign({ key: index }, step))); }))); };
export var WithoutDescription = WithoutDescriptionTemplate.bind({});
var LongTextsTemplate = function (args) { return (React.createElement(Stepper, __assign({}, args), longTextSteps.map(function (step, index) { return (React.createElement(Step, __assign({ key: index }, step))); }))); };
export var LongTexts = LongTextsTemplate.bind({});
