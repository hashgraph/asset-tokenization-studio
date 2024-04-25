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
import { fireEvent } from "@testing-library/react";
import React from "react";
import { PageTitle } from "@Components/Navigation/PageTitle";
describe("<PageTitle/>", function () {
    var defaultText = "Content of the button";
    var defaultProps = {
        title: defaultText
    };
    var factoryComponent = function (props) {
        return render(React.createElement(PageTitle, __assign({}, defaultProps, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
        expect(component.getByText(defaultText)).toBeVisible();
    });
    test("Should not render IconButton ", function () {
        var component = factoryComponent(__assign({}, defaultProps));
        expect(component.queryByRole("button")).not.toBeInTheDocument();
    });
    test("Should call onClickBack function ", function () {
        var props = __assign(__assign({}, defaultProps), { onGoBack: jest.fn() });
        var component = factoryComponent(__assign({}, props));
        fireEvent.click(component.getByRole("button"));
        expect(props.onGoBack).toBeCalledTimes(1);
    });
    test("Should render loading skeleton ", function () {
        var component = factoryComponent({
            isLoading: true
        });
        expect(component.container).toMatchSnapshot("WithLoading");
    });
});
