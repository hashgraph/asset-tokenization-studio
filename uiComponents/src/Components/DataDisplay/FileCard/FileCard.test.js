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
import { FileCard } from "./FileCard";
var errorMsg = "Error uploading the file, please try again.";
describe("<FileCard />", function () {
    var file = new File(["99999"], "filename.pdf", { type: "text/html" });
    var defaultProps = {
        file: file
    };
    var isInvalid = { isInvalid: true };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(FileCard, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows correctly file name", function () {
        var component = factoryComponent(__assign({}, defaultProps));
        var textName = component.getByTestId("text-filename");
        expect(textName.textContent).toBe(file.name);
    });
    test("shows error message when is invalid ", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), isInvalid));
        var textSize = component.getByTestId("text-size");
        expect(textSize.textContent).toContain(errorMsg);
    });
    test("should show skeleton when isLoading is true", function () {
        var component = factoryComponent(__assign({ isLoading: true }, defaultProps));
        expect(component.container).toMatchSnapshot("WithLoading");
    });
});
