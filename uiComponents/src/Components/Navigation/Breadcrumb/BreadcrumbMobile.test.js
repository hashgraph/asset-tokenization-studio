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
import { BreadcrumbMobile } from "./BreadcrumbMobile";
import { defaultProps } from "./commonTests";
describe("<BreadcrumbMobile />", function () {
    var factoryComponent = function (props) {
        return render(React.createElement(BreadcrumbMobile, __assign({}, props)));
    };
    test("renders correctly default", function () {
        var component = factoryComponent(defaultProps);
        expect(component.asFragment()).toMatchSnapshot("default");
    });
    test("should only show second last level", function () {
        var component = factoryComponent(defaultProps);
        var indexToShow = defaultProps.items.length - 2;
        defaultProps.items.forEach(function (item, index) {
            var breadcrumb = component.getByTestId("breadcrumb-mobile");
            if (index === indexToShow) {
                expect(breadcrumb).toHaveTextContent(item.label);
            }
            else {
                expect(breadcrumb).not.toHaveTextContent(item.label);
            }
        });
    });
    test("should have a link", function () {
        var component = factoryComponent(defaultProps);
        var link = component.getByTestId("breadcrumb-link");
        expect(link).toBeInTheDocument();
    });
    test("renders loading item", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { items: [
                {
                    label: "Loading",
                    link: "/loading"
                },
                {
                    label: "Loading",
                    link: "/loading",
                    isLoading: true
                },
                {
                    label: "Loading",
                    link: "/loading"
                },
            ] }));
        var loadingItem = component.getByTestId("breadcrumb-loading-item");
        expect(loadingItem).toBeInTheDocument();
    });
});
