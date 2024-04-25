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
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { Plus, DotsThree } from "@phosphor-icons/react";
import { Tag } from "./Tag";
describe("<Tag />", function () {
    var label = "Tag";
    var iconLeftProp = React.createElement(PhosphorIcon, { as: Plus });
    var iconRightProp = React.createElement(PhosphorIcon, { as: DotsThree });
    var sizeSmallProp = { size: "sm" };
    var sizeLargeProp = { size: "lg" };
    var solidVariantProp = { variant: "solid" };
    var outlineVariantProp = { variant: "outline" };
    var factoryComponent = function (props) { return render(React.createElement(Tag, __assign({}, props))); };
    test("renders correctly", function () {
        var component = factoryComponent({ label: label });
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows icon on left side", function () {
        var component = factoryComponent({ icon: iconLeftProp, label: label });
        expect(component.asFragment()).toMatchSnapshot("Using icon left");
    });
    test("shows icon on right side", function () {
        var component = factoryComponent({ icon: iconRightProp, label: label });
        expect(component.asFragment()).toMatchSnapshot("Using icon right");
    });
    test("shows small size", function () {
        var component = factoryComponent(__assign({ label: label }, sizeSmallProp));
        expect(component.asFragment()).toMatchSnapshot("Using size small");
    });
    test("shows large size", function () {
        var component = factoryComponent(__assign({ label: label }, sizeLargeProp));
        expect(component.asFragment()).toMatchSnapshot("Using size large");
    });
    test("shows solid variant", function () {
        var component = factoryComponent(__assign({ label: label }, solidVariantProp));
        expect(component.asFragment()).toMatchSnapshot("Using variant solid");
    });
    test("shows outline variant", function () {
        var component = factoryComponent(__assign({ label: label }, outlineVariantProp));
        expect(component.asFragment()).toMatchSnapshot("Using variant outline");
    });
    test("shows skeleton when isLoading is true", function () {
        var component = factoryComponent({ label: label, isLoading: true });
        expect(component.asFragment()).toMatchSnapshot("WithLoading");
    });
});
