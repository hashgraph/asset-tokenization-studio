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
import { ClipboardButton } from "./ClipboardButton";
var onCopyMock = jest.fn();
jest.mock("@chakra-ui/react", function () { return (__assign(__assign({}, jest.requireActual("@chakra-ui/react")), { useClipboard: jest.fn(function () { return ({
        hasCopied: false,
        onCopy: onCopyMock
    }); }) })); });
describe("< ".concat(ClipboardButton.name, "/>"), function () {
    var defaultProps = {
        value: "Hola mundo"
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = {}; }
        return render(React.createElement(ClipboardButton, __assign({}, defaultProps, props)));
    };
    it("should render without crashing", function () {
        var asFragment = factoryComponent().asFragment;
        expect(asFragment()).toMatchSnapshot();
    });
    it("should copy to clipboard", function () {
        var getByRole = factoryComponent().getByRole;
        var button = getByRole("button");
        fireEvent.click(button);
        expect(onCopyMock).toHaveBeenCalledTimes(1);
    });
});
