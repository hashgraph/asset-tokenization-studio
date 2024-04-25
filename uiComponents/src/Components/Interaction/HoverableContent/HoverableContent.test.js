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
import { HoverableContent } from "./HoverableContent";
import { Box } from "@chakra-ui/react";
import { fireEvent } from "@testing-library/react";
describe("<HoverableContent />", function () {
    var defaultProps = {
        hiddenContent: "Hover"
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(HoverableContent, __assign({}, props),
            React.createElement(Box, null, "Children")));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("renders content when children is hovered", function () {
        var component = factoryComponent();
        var wrapper = component.getByTestId("hoverable-content");
        expect(component.queryByText("Hover")).not.toBeInTheDocument();
        fireEvent.mouseEnter(wrapper);
        expect(component.queryByText("Hover")).toBeInTheDocument();
    });
});
