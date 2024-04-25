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
import React from "react";
import { CircularSlider } from "./CircularSlider";
describe("<CircularSlider />", function () {
    var textLabel = "radio item";
    var labelProp = { label: textLabel };
    var valueProp = { value: 40 };
    var sizeSmallProp = { size: "sm" };
    var sizeMediumProp = { size: "md" };
    var colorProp = { color: "red" };
    var factoryComponent = function (props) {
        return render(React.createElement(CircularSlider, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows correctly when a label is passed over it ", function () {
        var component = factoryComponent(labelProp);
        expect(component.getByText(textLabel)).toBeVisible();
        expect(component.asFragment()).toMatchSnapshot("Using label");
    });
    test("shows correctly when a value is passed over it ", function () {
        var component = factoryComponent(valueProp);
        expect(component.asFragment()).toMatchSnapshot("Using value");
    });
    test("shows correctly when size is small", function () {
        var component = factoryComponent(sizeSmallProp);
        expect(component.asFragment()).toMatchSnapshot("Using small size");
    });
    test("shows correctly when size is medium", function () {
        var component = factoryComponent(sizeMediumProp);
        expect(component.asFragment()).toMatchSnapshot("Using medium size");
    });
    test("shows correctly when a color is passed over it ", function () {
        var component = factoryComponent(colorProp);
        expect(component.asFragment()).toMatchSnapshot("Using color");
    });
    test("shows correctly when isLoading is true", function () {
        var component = factoryComponent({ isLoading: true });
        expect(component.asFragment()).toMatchSnapshot("Using isLoading");
    });
});
