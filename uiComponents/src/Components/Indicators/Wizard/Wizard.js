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
import React, { useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import { StepContextProvider, Stepper, Step, } from "@Components/Indicators/Stepper";
export var Wizard = function (_a) {
    var steps = _a.steps, variant = _a.variant, activeStep = _a.activeStep, setActiveStep = _a.setActiveStep, goToNext = _a.goToNext, goToPrevious = _a.goToPrevious, props = __rest(_a, ["steps", "variant", "activeStep", "setActiveStep", "goToNext", "goToPrevious"]);
    var styles = useChakraMultiStyleConfig("Stepper", { variant: variant });
    var currentStep = useMemo(function () {
        return steps[activeStep];
    }, [activeStep, steps]);
    return (React.createElement(Flex, { sx: styles.stepContainer },
        React.createElement(Stepper, { variant: variant, index: activeStep, sx: styles.stepper }, steps.map(function (step, stepIndex) {
            return step && React.createElement(Step, __assign({ sx: styles.step, key: stepIndex }, step));
        })),
        React.createElement(StepContextProvider, { value: {
                index: activeStep,
                count: steps.length,
                orientation: "horizontal",
                isLast: activeStep === steps.length - 1,
                isFirst: activeStep === 0,
                status: "active",
                setActiveStep: setActiveStep,
                goToNext: goToNext,
                goToPrevious: goToPrevious
            } }, currentStep && currentStep.content)));
};
