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
import { InfoDivider } from "./InfoDivider";
var defaultProps = {
    title: "Example",
    type: "main"
};
describe("< ".concat(InfoDivider.name, " />"), function () {
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(InfoDivider, __assign({}, props)));
    };
    describe("type: main", function () {
        test("Should render correctly with just title", function () {
            var component = factoryComponent();
            expect(component.asFragment()).toMatchSnapshot("Main - just title");
            expect(component.getByText(defaultProps.title)).toBeInTheDocument();
        });
        test("Should render correctly with number", function () {
            var number = 1;
            var component = factoryComponent(__assign(__assign({}, defaultProps), { number: number }));
            expect(component.asFragment()).toMatchSnapshot("Main - with number");
            expect(component.getByText("01")).toBeInTheDocument();
        });
        test("Should render correctly with step", function () {
            var step = 1;
            var component = factoryComponent(__assign(__assign({}, defaultProps), { step: step }));
            expect(component.asFragment()).toMatchSnapshot("Main - with step");
            expect(component.getByText(step)).toBeInTheDocument();
        });
    });
    describe("type: secondary", function () {
        test("Should render correctly with just title", function () {
            var component = factoryComponent(__assign(__assign({}, defaultProps), { type: "secondary" }));
            expect(component.asFragment()).toMatchSnapshot("Secondary - just title");
        });
        test("Should render correctly with number", function () {
            var number = 1;
            var component = factoryComponent(__assign(__assign({}, defaultProps), { type: "secondary", number: number }));
            expect(component.asFragment()).toMatchSnapshot("Secondary - with number");
            expect(component.getByText("01")).toBeInTheDocument();
        });
    });
    test("should be wrapped by a legend if as is passed", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { as: "legend" }));
        expect(component.getByTestId("info-divider").nodeName).toBe("LEGEND");
    });
    test("should be wrapped by a div by default", function () {
        var component = factoryComponent();
        expect(component.getByTestId("info-divider").nodeName).toBe("DIV");
    });
    test("should show skeleton when isLoading is true", function () {
        var component = factoryComponent(__assign({ isLoading: true }, defaultProps));
        expect(component.container).toMatchSnapshot("WithLoading");
    });
});
