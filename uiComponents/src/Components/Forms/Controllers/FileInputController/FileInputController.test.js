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
import { act, fireEvent } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FileInputController } from "./FileInputController";
import React from "react";
import { render } from "@/test-utils";
describe("FileInputController />", function () {
    var defaultProps = {
        id: "file"
    };
    var RenderWithForm = function (props) {
        var localForm = useForm({
            mode: "onChange",
            criteriaMode: "all"
        });
        var control = localForm.control;
        return React.createElement(FileInputController, __assign({ control: control }, props));
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(RenderWithForm, __assign({}, props)));
    };
    test("Component renders correctly", function () {
        var component = factoryComponent();
        var id = defaultProps.id;
        expect(component.getByTestId(id)).toBeInTheDocument();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("should add a file to the state", function () {
        var component = factoryComponent();
        var fileInput = component.getByTestId(defaultProps.id);
        act(function () {
            var file = new File(["file content"], "file.png", {
                type: "image/png"
            });
            Object.defineProperty(fileInput, "files", {
                value: [file]
            });
            fireEvent.change(fileInput);
        });
        // @ts-ignore
        expect(fileInput.files.length).toBe(1);
    });
});
