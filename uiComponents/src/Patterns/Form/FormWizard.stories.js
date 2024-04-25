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
import { Button } from "@Components/Interaction/Button";
import { SelectController } from "@Components/Forms/Controllers";
import { Text } from "@/Components/Foundations/Text";
import { useStepContext, useSteps } from "@Components/Indicators/Stepper";
import { Wizard } from "@Components/Indicators/Wizard";
import React from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
var meta = {
    title: "Patterns/Form Patterns/form wizard",
    argTypes: {},
    parameters: {
        previewTabs: {
            canvas: {
                hidden: true
            }
        },
        viewMode: "docs",
        docs: {}
    },
    args: {}
};
export default meta;
var Step1 = function () {
    var control = useFormContext().control;
    var goToNext = useStepContext().goToNext;
    return (React.createElement(React.Fragment, null,
        React.createElement(SelectController, { id: "field", control: control, setsFullOption: true, options: [
                { label: "value 1", value: "VAL-1" },
                { label: "value 2", value: "VAL-2" },
            ] }),
        React.createElement(Button, { onClick: goToNext }, "next")));
};
var Step2 = function () {
    var getValues = useFormContext().getValues;
    var goToPrevious = useStepContext().goToPrevious;
    return (React.createElement(React.Fragment, null,
        React.createElement(Text, null, getValues("field").label),
        React.createElement(Button, { onClick: goToPrevious }, "prev")));
};
var Template = function () {
    var form = useForm();
    var steps = useSteps();
    return (React.createElement(FormProvider, __assign({}, form),
        React.createElement(Wizard, __assign({}, steps, { steps: [
                { title: "step 1", content: React.createElement(Step1, null) },
                { title: "step2", content: React.createElement(Step2, null) },
            ] }))));
};
export var Default = Template.bind({});
