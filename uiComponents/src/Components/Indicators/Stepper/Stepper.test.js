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
import { render } from "@/test-utils";
import { Stepper, Step } from "./index";
var steps = [
    {
        title: "First",
        description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    { title: "Second", description: "Date & Time" },
    { title: "Third", description: "Select Rooms" },
];
describe("< ".concat(Stepper.name, " />"), function () {
    var factoryComponent = function (props) {
        if (props === void 0) { props = {}; }
        return render(React.createElement(Stepper, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent({
            index: 1,
            children: steps.map(function (step, index) { return React.createElement(Step, __assign({ key: index }, step)); })
        });
        expect(component.asFragment()).toMatchSnapshot("Default Stepper");
    });
    test("renders correctly with index", function () {
        var component = factoryComponent({
            index: 2,
            children: steps.map(function (step, index) { return React.createElement(Step, __assign({ key: index }, step)); })
        });
        expect(component.asFragment()).toMatchSnapshot("Stepper with index");
    });
});
