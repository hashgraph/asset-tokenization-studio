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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React from "react";
import { render } from "@/test-utils";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BreadcrumbDesktop } from "./BreadcrumbDesktop";
import { customProps, defaultProps } from "./commonTests";
describe("<BreadcrumbDesktop />", function () {
    var factoryComponent = function (props) {
        return render(React.createElement(BreadcrumbDesktop, __assign({}, props)));
    };
    test("renders correctly default", function () {
        var component = factoryComponent(defaultProps);
        expect(component.asFragment()).toMatchSnapshot("default");
    });
    test("renders correctly with maxItems to show", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { showMaxItems: true }));
        expect(component.asFragment()).toMatchSnapshot("showMaxItems");
    });
    test("if showMaxItems is true should show a button to open hidden elements", function () { return __awaiter(void 0, void 0, void 0, function () {
        var component, menuList, hiddenElement, menuButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    component = factoryComponent(__assign(__assign({}, defaultProps), { showMaxItems: true }));
                    menuList = component.getByTestId("breadcrumb-dropdown");
                    expect(menuList).toBeInTheDocument();
                    expect(menuList).not.toBeVisible();
                    hiddenElement = component.getByText("Level 2");
                    expect(hiddenElement).toBeInTheDocument();
                    expect(hiddenElement).not.toBeVisible();
                    menuButton = component.getByTestId("breadcrumb-menu-button");
                    expect(menuButton).toBeInTheDocument();
                    return [4 /*yield*/, waitFor(function () {
                            userEvent.click(menuButton);
                            expect(menuList).toBeVisible();
                            expect(hiddenElement).toBeVisible();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("should have a link for each element", function () { return __awaiter(void 0, void 0, void 0, function () {
        var component, breadcrumb, elements;
        return __generator(this, function (_a) {
            component = factoryComponent(defaultProps);
            breadcrumb = component.getByTestId("breadcrumb-desktop");
            elements = breadcrumb.getElementsByClassName("chakra-breadcrumb__link");
            expect(elements.length).toEqual(defaultProps.items.length);
            return [2 /*return*/];
        });
    }); });
    test("renders custom links", function () {
        var component = factoryComponent(customProps);
        var items = customProps.items;
        items.forEach(function (item, index) {
            var link = component.getByTestId("custom-link-".concat(index));
            expect(link).toBeInTheDocument();
        });
    });
    test("renders loading item", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { items: __spreadArray(__spreadArray([], defaultProps.items, true), [
                {
                    label: "Loading",
                    link: "/loading",
                    isLoading: true
                },
            ], false) }));
        var loadingItem = component.getByTestId("breadcrumb-loading-item");
        expect(loadingItem).toBeInTheDocument();
    });
});
