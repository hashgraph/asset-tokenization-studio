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
import { render } from "@/test-utils";
import { addonLeftInput, addonRightInput } from "@/storiesUtils";
import React from "react";
import { Select } from "./Select";
var options = [
    { label: "Option 1", value: 1 },
    { label: "Option 2", value: 2 },
];
describe("<Select />", function () {
    var defaultProps = {
        placeholder: "Hello",
        options: options
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Select, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    var sizes = ["sm", "md", "lg"];
    sizes.forEach(function (size) {
        test("renders correctly with size ".concat(size), function () {
            var component = factoryComponent(__assign(__assign({}, defaultProps), { size: size }));
            expect(component.asFragment()).toMatchSnapshot("Using size ".concat(size));
        });
    });
    test("renders correctly with addonRight", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { addonRight: addonRightInput.OneIcon }));
        expect(component.asFragment()).toMatchSnapshot("Using addonRight");
    });
    test("renders correctly with addonLeft", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { addonLeft: addonLeftInput.Example1 }));
        expect(component.asFragment()).toMatchSnapshot("Using addonLeft");
    });
    test("renders correctly with custom dropdownIndicator", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { dropdownIndicator: addonLeftInput.Example1 }));
        expect(component.asFragment()).toMatchSnapshot("Using custom dropdownIndicator");
    });
    test("renders correctly with isDisabled", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { isDisabled: true }));
        expect(component.asFragment()).toMatchSnapshot("Using as disabled");
    });
    test("renders correctly with isInvalid", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { isInvalid: true }));
        expect(component.asFragment()).toMatchSnapshot("Using as invalid");
    });
    test("renders correctly with isRequired", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { isRequired: true }));
        expect(component.asFragment()).toMatchSnapshot("With isRequired");
    });
    test("renders correctly with label", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { label: "Example label" }));
        expect(component.getByText("Example label")).toBeInTheDocument();
        expect(component.asFragment()).toMatchSnapshot("Using label");
    });
});
