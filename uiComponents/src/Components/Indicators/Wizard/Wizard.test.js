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
import { render } from "@/test-utils";
describe("< ".concat(Wizard.name, " />"), function () {
    var factoryComponent = function (props) {
        if (props === void 0) { props = {}; }
        return render(React.createElement(Wizard, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent({
            steps: [
                {
                    title: "First",
                    description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                    content: React.createElement("div", null, "First")
                },
                {
                    title: "Second",
                    description: "Contact Info ",
                    content: React.createElement("div", null, "Second")
                },
                {
                    title: "Third",
                    description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                    content: React.createElement("div", null, "Third")
                },
                {
                    title: "Four",
                    description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                    content: React.createElement("div", null, "Four")
                },
                {
                    title: "Five",
                    description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                    content: React.createElement("div", null, "Five")
                },
                {
                    title: "Six",
                    description: "Contact Info lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                    content: React.createElement("div", null, "Six")
                },
            ]
        });
        expect(component.asFragment()).toMatchSnapshot("Default Wizard");
    });
});
