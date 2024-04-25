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
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { render } from "@/test-utils";
import { Bluetooth } from "@phosphor-icons/react";
import React from "react";
import { InputIcon, InputIconButton, Input } from "./Input";
describe("<Input />", function () {
    var id = "test-input";
    var label = "label";
    var placeholder = "placeholder";
    var defaultProps = {
        id: id,
        label: label,
        placeholder: placeholder
    };
    var sizeMedium = { size: "md" };
    var sizeLarge = { size: "lg" };
    var addonLeft = {
        addonLeft: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Bluetooth }) })
    };
    var addonRight = {
        addonRight: (React.createElement(InputIconButton, { "aria-label": "Bluetooth", onClick: jest.fn(), icon: React.createElement(PhosphorIcon, { as: Bluetooth }) }))
    };
    var isDisabled = { isDisabled: true };
    var isInvalid = { isInvalid: true };
    var outlineVariant = { variant: "outline" };
    var topDescription = { topDescription: "This is a description" };
    var bottomDescription = { bottomDescription: "This is a description" };
    var subLabel = { subLabel: "This is a sublabel" };
    var getLabelElement = function (component) {
        return component.container.querySelector("span#label");
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Input, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows correctly when size is medium", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), sizeMedium));
        expect(component.asFragment()).toMatchSnapshot("Using medium size");
    });
    test("shows correctly when size is large", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), sizeLarge));
        var labelBlock = getLabelElement(component);
        expect(labelBlock).toHaveTextContent(label);
        expect(component.asFragment()).toMatchSnapshot("Using large size");
    });
    test("shows correctly when is disabled", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), isDisabled));
        expect(component.asFragment()).toMatchSnapshot("Using as disabled");
    });
    test("shows correctly when is invalid", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), isInvalid));
        expect(component.asFragment()).toMatchSnapshot("Using as invalid");
    });
    test("shows correctly when uses outline variant", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), outlineVariant));
        expect(component.asFragment()).toMatchSnapshot("Using outline variant");
    });
    test("shows correctly when uses addon left", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), addonLeft));
        expect(component.asFragment()).toMatchSnapshot("Using addon left");
    });
    test("shows correctly when uses addon right", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), addonRight));
        expect(component.asFragment()).toMatchSnapshot("Using addon right");
    });
    test("shows correctly when isSuccess", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { isSuccess: true }));
        expect(component.asFragment()).toMatchSnapshot("Is Success");
    });
    test("shows correctly when isRequired", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { isRequired: true }));
        expect(component.asFragment()).toMatchSnapshot("Is required");
    });
    test("shows correctly when uses addon right and input is invalid", function () {
        var component = factoryComponent(__assign(__assign(__assign({}, defaultProps), addonRight), isInvalid));
        expect(component.asFragment()).toMatchSnapshot("Using addon right and invalid");
    });
    test("shows correctly with topDescription", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), topDescription));
        expect(component.getByText(topDescription.topDescription)).toBeInTheDocument();
        expect(component.asFragment()).toMatchSnapshot("Top Description");
    });
    test("shows correctly with bottomDescription", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), bottomDescription));
        expect(component.getByText(bottomDescription.bottomDescription)).toBeInTheDocument();
        expect(component.asFragment()).toMatchSnapshot("Bottom Description");
    });
    test("shows correctly with subLabel", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), subLabel));
        expect(component.getByText(subLabel.subLabel)).toBeInTheDocument();
        expect(component.asFragment()).toMatchSnapshot("Bottom Description");
    });
});
