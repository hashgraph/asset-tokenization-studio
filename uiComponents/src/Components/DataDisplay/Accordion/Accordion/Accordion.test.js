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
import { Box, Text } from "@chakra-ui/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Accordion } from "./Accordion";
import { AccordionItem } from "../AccordionItem";
var title = "Accordion Title";
var description = "Accordion Description";
var items = [
    {
        title: "First Element",
        content: "Content in First Element"
    },
    {
        title: "Second Element",
        content: "Content in Second Element"
    },
    {
        title: "Third Element",
        content: "Content in Third Element"
    },
];
var AccordionItems = function () {
    return (React.createElement(Box, null,
        React.createElement(AccordionItem, { title: items[0].title },
            React.createElement(Text, null, items[0].content)),
        React.createElement(AccordionItem, { title: items[1].title },
            React.createElement(Text, null, items[1].content)),
        React.createElement(AccordionItem, { title: items[2].title },
            React.createElement(Text, null, items[2].content))));
};
var defaultProps = {
    title: title,
    children: React.createElement(AccordionItems, null)
};
describe("<Accordion />", function () {
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Accordion, __assign({}, props)));
    };
    var checkAllIsCollapsed = function (component) {
        items.forEach(function (item) {
            expect(component.getByText(item.title)).toBeVisible();
            expect(component.queryByText(item.content)).not.toBeVisible();
        });
    };
    test("should render correctly", function () {
        var component = factoryComponent();
        expect(component).toMatchSnapshot();
    });
    test("should render with description", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { description: description }));
        expect(component.getByText(description)).toBeVisible();
    });
    test("should render collapsed items", function () {
        var component = factoryComponent();
        checkAllIsCollapsed(component);
    });
    // TODO: improve this test, works in local but fails in pipeline
    test.skip("by default when open an item all other items are collapsed", function () { return __awaiter(void 0, void 0, void 0, function () {
        var component;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    component = factoryComponent(__assign({}, defaultProps));
                    checkAllIsCollapsed(component);
                    userEvent.click(component.getByText(items[0].title));
                    return [4 /*yield*/, waitFor(function () {
                            expect(component.getByText(items[0].content)).toBeVisible();
                            expect(component.queryByText(items[1].content)).not.toBeVisible();
                            expect(component.queryByText(items[2].content)).not.toBeVisible();
                        })];
                case 1:
                    _a.sent();
                    userEvent.click(component.getByText(items[1].title));
                    return [4 /*yield*/, waitFor(function () {
                            expect(component.queryByText(items[0].content)).not.toBeVisible();
                            expect(component.getByText(items[1].content)).toBeVisible();
                            expect(component.queryByText(items[2].content)).not.toBeVisible();
                        })];
                case 2:
                    _a.sent();
                    userEvent.click(component.getByText(items[2].title));
                    return [4 /*yield*/, waitFor(function () {
                            expect(component.queryByText(items[0].content)).not.toBeVisible();
                            expect(component.queryByText(items[1].content)).not.toBeVisible();
                            expect(component.getByText(items[2].content)).toBeVisible();
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test.skip("with AllowMultiple all items could be expanded", function () { return __awaiter(void 0, void 0, void 0, function () {
        var component;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    component = factoryComponent(__assign(__assign({}, defaultProps), { allowMultiple: true }));
                    checkAllIsCollapsed(component);
                    userEvent.click(component.getByText(items[0].title));
                    return [4 /*yield*/, waitFor(function () {
                            expect(component.getByText(items[0].content)).toBeVisible();
                            expect(component.queryByText(items[1].content)).not.toBeVisible();
                            expect(component.queryByText(items[2].content)).not.toBeVisible();
                        })];
                case 1:
                    _a.sent();
                    userEvent.click(component.getByText(items[1].title));
                    return [4 /*yield*/, waitFor(function () {
                            expect(component.getByText(items[0].content)).toBeVisible();
                            expect(component.getByText(items[1].content)).toBeVisible();
                            expect(component.queryByText(items[2].content)).not.toBeVisible();
                        })];
                case 2:
                    _a.sent();
                    userEvent.click(component.getByText(items[2].title));
                    return [4 /*yield*/, waitFor(function () {
                            expect(component.getByText(items[0].content)).toBeVisible();
                            expect(component.getByText(items[1].content)).toBeVisible();
                            expect(component.getByText(items[2].content)).toBeVisible();
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
