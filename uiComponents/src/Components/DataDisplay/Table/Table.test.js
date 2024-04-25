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
import { Table } from "./Table";
import { createColumnHelper } from "@tanstack/react-table";
var columnHelper = createColumnHelper();
var data = [
    {
        name: "Name 1",
        dltAddress: "12345",
        amount: 23
    },
    {
        name: "Name 2",
        dltAddress: "54321",
        amount: 53
    },
];
var columns = [
    columnHelper.accessor("name", {
        header: function () { return "Name"; },
        enableSorting: false
    }),
    columnHelper.accessor("dltAddress", {
        header: function () { return "Dlt address"; },
        enableSorting: false
    }),
    columnHelper.accessor("amount", {
        header: "Amount",
        enableSorting: false
    }),
    columnHelper.display({
        id: "action",
        header: "-",
        size: 55,
        cell: function () { return React.createElement(React.Fragment, null, "+"); }
    }),
];
describe("<Table />", function () {
    var simpleVariant = { variant: "simple" };
    var factoryComponent = function (props) {
        return render(React.createElement(Table, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent({ data: data, columns: columns, name: "table" });
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("renders correctly with simple variant", function () {
        var component = factoryComponent(__assign({ data: data, columns: columns, name: "table" }, simpleVariant));
        expect(component.asFragment()).toMatchSnapshot("Using simple variant");
    });
    test("renders correctly with isLoading", function () {
        var component = factoryComponent({
            data: data,
            columns: columns,
            name: "table",
            isLoading: true
        });
        expect(component.asFragment()).toMatchSnapshot("Using isLoading");
    });
    test("Should render empty component", function () {
        var component = factoryComponent({
            data: [],
            columns: columns,
            name: "table",
            emptyComponent: React.createElement("div", null, "Empty")
        });
        expect(component.asFragment()).toMatchSnapshot("Using emptyComponent");
    });
    test("Should no render empty component when data is not empty", function () {
        var component = factoryComponent({
            data: data,
            columns: columns,
            name: "table",
            emptyComponent: React.createElement("div", null, "Empty")
        });
        expect(component.asFragment()).toMatchSnapshot("Not render emptyComponent when data is not empty");
    });
    test("Should no render empty component when isLoading is true", function () {
        var component = factoryComponent({
            data: [],
            columns: columns,
            name: "table",
            isLoading: true,
            emptyComponent: React.createElement("div", null, "Empty")
        });
        expect(component.asFragment()).toMatchSnapshot("Not render emptyComponent when isLoading is true");
    });
});
