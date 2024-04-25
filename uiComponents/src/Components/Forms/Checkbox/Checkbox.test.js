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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { render } from "@/test-utils";
import { Text as ChakraText } from "@chakra-ui/react";
import { Icon } from "@/Components/Foundations/Icon";
import { act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Checkbox } from "./Checkbox";
import { HouseLine } from "@phosphor-icons/react";
describe("<Checkbox />", function () {
    var testId = "test-checkbox";
    var textCheckbox = "checkbox item";
    var childrenProp = { children: React.createElement(ChakraText, null, textCheckbox) };
    var sizeExtraSmallProp = { size: "xs" };
    var sizeSmallProp = { size: "sm" };
    var sizeMediumProp = { size: "md" };
    var sizeLargeProp = { size: "lg" };
    var iconProp = { icon: React.createElement(Icon, { as: HouseLine }) };
    var isDisabledProp = { isDisabled: true };
    var isInvalidProp = { isInvalid: true };
    var defaultCheckedProp = { defaultChecked: true };
    var squareVariantProp = { variant: "square" };
    var circleVariantProp = { variant: "circle" };
    var getInput = function (component) {
        return component.getByTestId(testId).querySelector("input");
    };
    var clickOnCheckbox = function (component) {
        act(function () {
            userEvent.click(getInput(component));
        });
    };
    var checkStatusRadio = function (component, status) {
        return waitFor(function () {
            status
                ? expect(getInput(component)).toBeChecked()
                : expect(getInput(component)).not.toBeChecked();
        });
    };
    var factoryComponent = function (props) {
        return render(React.createElement(Checkbox, __assign({ name: "test", "data-testid": testId }, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows correctly children", function () {
        var component = factoryComponent(childrenProp);
        expect(component.getByText(textCheckbox)).toBeVisible();
        expect(component.asFragment()).toMatchSnapshot("Using children");
    });
    test("shows new state when does click", function () { return __awaiter(void 0, void 0, void 0, function () {
        var component;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    component = factoryComponent();
                    clickOnCheckbox(component);
                    return [4 /*yield*/, checkStatusRadio(component, true)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("shows correctly when size is extra small", function () {
        var component = factoryComponent(sizeExtraSmallProp);
        expect(component.asFragment()).toMatchSnapshot("Using extra small size");
    });
    test("shows correctly when size is small", function () {
        var component = factoryComponent(sizeSmallProp);
        expect(component.asFragment()).toMatchSnapshot("Using small size");
    });
    test("shows correctly when size is medium", function () {
        var component = factoryComponent(sizeMediumProp);
        expect(component.asFragment()).toMatchSnapshot("Using medium size");
    });
    test("shows correctly when size is large", function () {
        var component = factoryComponent(sizeLargeProp);
        expect(component.asFragment()).toMatchSnapshot("Using large size");
    });
    test("shows correctly when is disabled", function () { return __awaiter(void 0, void 0, void 0, function () {
        var component;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    component = factoryComponent(isDisabledProp);
                    clickOnCheckbox(component);
                    return [4 /*yield*/, checkStatusRadio(component, false)];
                case 1:
                    _a.sent();
                    expect(component.asFragment()).toMatchSnapshot("Using as disabled");
                    return [2 /*return*/];
            }
        });
    }); });
    test("shows correctly when is invalid", function () {
        var component = factoryComponent(isInvalidProp);
        expect(component.asFragment()).toMatchSnapshot("Using as invalid");
    });
    test("shows correctly when is checked by default", function () {
        var component = factoryComponent(defaultCheckedProp);
        expect(component.asFragment()).toMatchSnapshot("Using as default checked");
    });
    test("shows correctly when uses square variant", function () {
        var component = factoryComponent(squareVariantProp);
        expect(component.asFragment()).toMatchSnapshot("Using square variant");
    });
    test("shows correctly when uses circle variant", function () {
        var component = factoryComponent(circleVariantProp);
        expect(component.asFragment()).toMatchSnapshot("Using circle variant");
    });
    test("shows correctly when is checked and disabled", function () {
        var component = factoryComponent(__assign(__assign({}, defaultCheckedProp), isDisabledProp));
        expect(component.asFragment()).toMatchSnapshot("Using as default checked and disabled");
    });
    test("shows correctly when uses other icon", function () {
        var component = factoryComponent(iconProp);
        expect(component.asFragment()).toMatchSnapshot("Using other icon");
    });
});
