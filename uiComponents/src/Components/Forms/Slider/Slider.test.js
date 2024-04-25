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
import { Slider } from "./Slider";
//@ts-ignore
var ResizeObserver = window.ResizeObserver;
beforeEach(function () {
    //@ts-ignore
    delete window.ResizeObserver;
    window.ResizeObserver = jest.fn().mockImplementation(function () { return ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
    }); });
});
afterEach(function () {
    window.ResizeObserver = ResizeObserver;
    jest.restoreAllMocks();
});
describe("<Slider />", function () {
    var defaultProps = {
        defaultValue: 30
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Slider, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows the default value", function () {
        var _a;
        var defaultValue = 70;
        var component = factoryComponent({ defaultValue: defaultValue });
        var container = component.container;
        expect((_a = container.querySelector("input")) === null || _a === void 0 ? void 0 : _a.value).toBe("".concat(defaultValue));
        expect(component.asFragment()).toMatchSnapshot("with default value");
    });
    test("shows horizontal slider", function () {
        var component = factoryComponent({ orientation: "horizontal" });
        expect(component.getByRole("slider")).toBeInTheDocument();
        expect(component.getByRole("slider").getAttribute("aria-orientation")).toBe("horizontal");
        expect(component.asFragment()).toMatchSnapshot("horizontal slider");
    });
    test("shows vertical slider", function () {
        var component = factoryComponent({ orientation: "vertical" });
        expect(component.getByRole("slider")).toBeInTheDocument();
        expect(component.getByRole("slider").getAttribute("aria-orientation")).toBe("vertical");
        expect(component.asFragment()).toMatchSnapshot("vertical slider");
    });
});
