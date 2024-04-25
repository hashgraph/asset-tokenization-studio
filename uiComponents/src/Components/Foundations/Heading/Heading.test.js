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
import { render } from "../../../test-utils";
import { Heading } from "./Heading";
describe("<Heading />", function () {
    var defaultProps = {
        fontSize: "32px"
    };
    var themeCustom = {
        textStyles: {
            red: {
                color: "red"
            }
        },
        components: {
            Heading: {
                variants: {
                    light: {
                        fontFamily: "Helvetica Neue"
                    }
                }
            }
        }
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Heading, __assign({}, props, { "data-testid": "heading" }), "Title"), themeCustom);
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("renders correctly with text style", function () {
        var component = factoryComponent({ textStyle: "red" });
        expect(component.asFragment()).toMatchSnapshot("WithTextStyle");
    });
    test("renders correctly with variant", function () {
        var component = factoryComponent({ variant: "light" });
        expect(component.asFragment()).toMatchSnapshot("WithVariant");
    });
    test("renders correctly with custom heading tag", function () {
        var component = factoryComponent({ as: "h1" });
        expect(component.getByTestId("heading").tagName).toBe("H1");
        expect(component.asFragment()).toMatchSnapshot("WithCustomTag");
    });
});
