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
import { Header } from "./Header";
import { Stack } from "@chakra-ui/react";
import { Logo } from "@/Components/Basic/Logo";
import { Avatar } from "@/Components/Basic/Avatar";
describe("<Header />", function () {
    var defaultProps = {
        leftContent: (React.createElement(Stack, { "data-testid": "left-content", spacing: 6 },
            React.createElement(Logo, { alt: "IOB" }))),
        rightContent: (React.createElement("div", { "data-testid": "right-content" },
            React.createElement(Avatar, null)))
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Header, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.getByTestId("header")).toBeInTheDocument();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("renders correctly only left content", function () {
        var component = factoryComponent({
            leftContent: defaultProps.leftContent
        });
        expect(component.getByTestId("left-content")).toBeVisible();
        expect(component.queryByTestId("right-content")).toBeNull();
        expect(component.asFragment()).toMatchSnapshot("OnlyLeftContent");
    });
    test("renders correctly only right content", function () {
        var component = factoryComponent({
            rightContent: defaultProps.rightContent
        });
        expect(component.getByTestId("right-content")).toBeVisible();
        expect(component.queryByTestId("left-content")).toBeNull();
        expect(component.asFragment()).toMatchSnapshot("OnlyRightContent");
    });
});
