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
import { fireEvent } from "@testing-library/react";
import { DefinitionList, DefinitionListGrid } from "./index";
import { Box } from "@chakra-ui/react";
var onCopyMock = jest.fn();
jest.mock("@chakra-ui/react", function () { return (__assign(__assign({}, jest.requireActual("@chakra-ui/react")), { useClipboard: jest.fn(function () { return ({
        hasCopied: false,
        onCopy: onCopyMock
    }); }) })); });
var items = [
    {
        title: "List Title",
        description: "List Description",
        canCopy: true
    },
    {
        title: "List Title 2",
        description: "List Description"
    },
    {
        title: "List Title 3",
        description: "List Description"
    },
    {
        title: "With custom content",
        description: React.createElement(Box, { "data-testid": "custom-content" }),
        valueToCopy: "custom value copied",
        canCopy: true
    },
];
var defaultProps = {
    title: "List Title",
    items: items
};
describe("< ".concat(DefinitionList.name, " />"), function () {
    var componentFactory = function (props) {
        if (props === void 0) { props = {}; }
        return render(React.createElement(DefinitionList, __assign({}, defaultProps, props)));
    };
    test("Should match to snapshot", function () {
        var container = componentFactory().container;
        expect(container).toMatchSnapshot();
    });
    test("Should copy to clipboard", function () {
        var _a = componentFactory(), getByLabelText = _a.getByLabelText, getByTestId = _a.getByTestId;
        var wrapper = getByTestId("definition-list-item-".concat(items[0].title));
        fireEvent.mouseEnter(wrapper);
        var copyButton = getByLabelText("Copy to clipboard-".concat(items[0].description));
        expect(copyButton).toBeInTheDocument();
        fireEvent.click(copyButton);
        expect(onCopyMock).toBeCalledTimes(1);
    });
    test("Should copy to clipboard custom value", function () {
        var _a = componentFactory(), getByLabelText = _a.getByLabelText, getByTestId = _a.getByTestId;
        var wrapper = getByTestId("definition-list-item-".concat(items[3].title));
        fireEvent.mouseEnter(wrapper);
        var copyButton = getByLabelText("Copy to clipboard-".concat(items[3].valueToCopy));
        expect(copyButton).toBeInTheDocument();
        fireEvent.click(copyButton);
        expect(onCopyMock).toBeCalledTimes(1);
    });
    test("Should render custom content", function () {
        var getByTestId = componentFactory().getByTestId;
        expect(getByTestId("custom-content")).toBeInTheDocument();
    });
    test("Should render with grid", function () {
        var container = render(React.createElement(DefinitionListGrid, __assign({}, defaultProps, { columns: 2 }),
            React.createElement(DefinitionList, __assign({}, defaultProps)),
            React.createElement(DefinitionList, __assign({}, defaultProps)))).container;
        expect(container).toMatchSnapshot();
    });
    test("Should render with loading", function () {
        var container = componentFactory({ isLoading: true }).container;
        expect(container).toMatchSnapshot("WithLoading");
    });
    test("Should render with loading item", function () {
        var container = componentFactory({
            isLoading: true,
            items: __spreadArray(__spreadArray([], items, true), [
                {
                    title: "List Title",
                    description: "List Description",
                    isLoading: true
                },
            ], false)
        }).container;
        expect(container).toMatchSnapshot("WithLoadingItem");
    });
});
