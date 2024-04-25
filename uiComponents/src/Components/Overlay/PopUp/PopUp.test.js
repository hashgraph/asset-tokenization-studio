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
import { fireEvent } from "@testing-library/react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Clock } from "@phosphor-icons/react";
import { PopUp } from "./index";
var defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    icon: React.createElement(PhosphorIcon, { as: Clock })
};
describe("< ".concat(PopUp.name, "/>"), function () {
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(PopUp, __assign({}, props)));
    };
    it("should render the default component", function () {
        var asFragment = factoryComponent().asFragment;
        expect(asFragment()).toMatchSnapshot();
    });
    it("should call onClose when clicks in closeButton", function () {
        var ariaLabel = "close-button";
        var getByLabelText = factoryComponent().getByLabelText;
        var closeButton = getByLabelText(ariaLabel);
        fireEvent.click(closeButton);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
    it("should render with footer component", function () {
        var props = __assign(__assign({}, defaultProps), { onCancel: jest.fn(), onConfirm: jest.fn() });
        var component = factoryComponent(props);
        expect(component.asFragment()).toMatchSnapshot();
    });
    it("should call onCancel when clicks on cancel button", function () {
        var props = __assign(__assign({}, defaultProps), { onCancel: jest.fn(), onConfirm: jest.fn() });
        var ariaLabel = "cancel-button";
        var getByLabelText = factoryComponent(props).getByLabelText;
        var cancelButton = getByLabelText(ariaLabel);
        fireEvent.click(cancelButton);
        expect(props.onCancel).toHaveBeenCalled();
    });
    it("should call onConfirm when clicks on confirm button", function () {
        var props = __assign(__assign({}, defaultProps), { onCancel: jest.fn(), onConfirm: jest.fn() });
        var ariaLabel = "ok-button";
        var getByLabelText = factoryComponent(props).getByLabelText;
        var okButton = getByLabelText(ariaLabel);
        fireEvent.click(okButton);
        expect(props.onConfirm).toHaveBeenCalled();
    });
    it("should render with one button in footer component", function () {
        var props = __assign(__assign({}, defaultProps), { onConfirm: jest.fn() });
        var component = factoryComponent(props);
        expect(component.asFragment()).toMatchSnapshot();
    });
    it("should render with no overlay", function () {
        var props = __assign(__assign({}, defaultProps), { showOverlay: false });
        var component = factoryComponent(props);
        expect(component.asFragment()).toMatchSnapshot();
    });
});
