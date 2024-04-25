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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
import { Input } from "@/Components/Forms";
import { ClipboardButton } from "@/Components/Interaction/ClipboardButton";
import { HoverableContent } from "@/Components/Interaction/HoverableContent";
import { IconButton } from "@Components/Interaction/IconButton";
import { Box } from "@chakra-ui/react";
import { Link } from "@phosphor-icons/react";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useState } from "react";
import { Text } from "../../Foundations";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { Button } from "../../Interaction/Button";
import { Tag } from "../Tag";
import { Table } from "./Table";
import { MultiTextCell } from "./components/MultiTextCell";
import { TableTitle } from "./components/TableTitle";
var date = function () {
    var date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));
    return date.toLocaleString();
};
var data = [
    {
        type: "Sale",
        price: "$200.00",
        fromUser: "@Raymond",
        toUser: "@Jane",
        date: date(),
        status: "BLOCKED"
    },
    {
        type: "Sale",
        price: "$100.00",
        fromUser: "@John",
        toUser: "@Mary",
        date: date(),
        status: "DRAFT"
    },
    {
        type: "Sale",
        price: "$300.00",
        fromUser: "@John",
        toUser: "@Mary",
        date: date(),
        status: "ENABLED"
    },
    {
        type: "Sale",
        price: "$200.00",
        fromUser: "@John",
        toUser: "@Mary",
        date: date(),
        status: "ENABLED"
    },
    {
        type: "Sale long long long text",
        price: "$500.00",
        fromUser: "@John",
        toUser: "@Mary",
        date: date(),
        status: "ENABLED"
    },
];
var columnHelper = createColumnHelper();
var columns = [
    columnHelper.accessor("type", {}),
    columnHelper.accessor("price", {
        header: function () { return "Price with IVA"; }
    }),
    columnHelper.accessor("fromUser", {
        header: "from user",
        enableSorting: false,
        meta: {
            isFocusable: false
        },
        cell: function (_a) {
            var getValue = _a.getValue;
            return (React.createElement(HoverableContent, { hiddenContent: React.createElement(ClipboardButton, { value: getValue() }) }, getValue().toUpperCase()));
        }
    }),
    columnHelper.accessor("toUser", {
        header: "to user",
        enableSorting: false,
        cell: function (_a) {
            var getValue = _a.getValue;
            return (React.createElement(MultiTextCell, { subtext: "Text", type: "upper", text: getValue() }));
        }
    }),
    columnHelper.accessor("date", {
        header: "Date"
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: function (_a) {
            var getValue = _a.getValue;
            return React.createElement(Tag, { size: "sm", label: getValue() });
        }
    }),
    columnHelper.display({
        id: "action",
        header: "Action",
        cell: function (props) { return (React.createElement(Button, { size: "sm", variant: "primary", onClick: function (e) {
                e.stopPropagation();
                console.log("button clicked");
            } }, "button")); }
    }),
    columnHelper.display({
        id: "decor",
        header: "-",
        cell: function () { return React.createElement(React.Fragment, null, "+"); }
    }),
];
var simpleTableColumnHelper = createColumnHelper();
var dataSimple = [
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
var simpleTableColumns = [
    simpleTableColumnHelper.accessor("name", {
        header: function () { return "Name"; },
        enableSorting: false
    }),
    simpleTableColumnHelper.accessor("dltAddress", {
        header: function () { return "Dlt address"; },
        enableSorting: false
    }),
    simpleTableColumnHelper.accessor("amount", {
        header: "Amount",
        enableSorting: false
    }),
    simpleTableColumnHelper.display({
        id: "action",
        header: "-",
        size: 55,
        cell: function () { return React.createElement(React.Fragment, null, "+"); }
    }),
];
var expandableTableColumns = [
    simpleTableColumnHelper.accessor("name", {
        header: function () { return "Name"; },
        enableSorting: false
    }),
    simpleTableColumnHelper.accessor("dltAddress", {
        header: function () { return "Dlt address"; },
        enableSorting: false
    }),
    simpleTableColumnHelper.accessor("amount", {
        header: "Amount",
        enableSorting: false
    }),
    simpleTableColumnHelper.display({
        id: "action",
        header: "-",
        size: 55,
        cell: function () { return React.createElement(React.Fragment, null, "+"); }
    }),
];
var meta = {
    title: "Design System/Data Display/Table",
    component: Table,
    argTypes: {
        variant: {
            options: ["simple", "unstyled", "striped"],
            control: { type: "select" }
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10740"
        },
        docs: {}
    },
    args: {
        onClickRow: undefined,
        isLoading: false,
        loadingColumnsCount: 3,
        columns: simpleTableColumns,
        data: dataSimple
    }
};
export default meta;
export var Template = function (args) {
    var _a = useState([]), sorting = _a[0], setSorting = _a[1];
    var _b = useState({
        pageIndex: 0,
        pageSize: 10
    }), pagination = _b[0], setPagination = _b[1];
    return (React.createElement(Box, { p: 4, bg: "neutral.50" },
        React.createElement(TableTitle, { actions: React.createElement(IconButton, { "aria-label": "link", variant: "tertiary", size: "sm", icon: React.createElement(PhosphorIcon, { as: Link }) }) }, "Table Title"),
        React.createElement(Table, { size: "lg", name: "table", sorting: sorting, setSorting: setSorting, pagination: pagination, totalPages: 10, totalElements: data.length, data: data, onClickRow: function (data) { return console.log("row clicked", data); }, setPagination: setPagination, columns: columns })));
};
export var TemplateSimple = function (_a) {
    var _ = _a.name, args = __rest(_a, ["name"]);
    return (React.createElement(Box, { maxW: "512px", p: 4, bg: "neutral.50" },
        React.createElement(Table, { size: "sm", name: "table", columns: simpleTableColumns, data: dataSimple, isLoading: args.isLoading, loadingColumnsCount: args.loadingColumnsCount })));
};
export var WithLoading = TemplateSimple.bind({});
WithLoading.args = {
    isLoading: true
};
export var WithEmptyComponent = TemplateSimple.bind({});
WithEmptyComponent.args = {
    emptyComponent: React.createElement(Text, null, "No data found"),
    data: undefined,
    isLoading: false
};
var RowExpandedContent = function (_a) {
    var row = _a.row;
    return (React.createElement(Box, { h: 20, position: "relative" },
        React.createElement(Box, { position: "absolute", left: 16, top: 2 },
            React.createElement(Text, null, row.original.name))));
};
export var ExpandableTemplate = function (_a) {
    var _ = _a.name, args = __rest(_a, ["name"]);
    return (React.createElement(Box, { maxW: "512px", p: 4, bg: "neutral.50" },
        React.createElement(Table, __assign({}, args, { size: "sm", name: "table", columns: expandableTableColumns, data: dataSimple, enableExpanding: true, rowExpandedContent: RowExpandedContent }))));
};
export var WithExpandableRow = ExpandableTemplate.bind({});
export var WithMultipleExpandableRows = ExpandableTemplate.bind({});
WithMultipleExpandableRows.args = {
    allowMultiExpand: true
};
var editableTableColumns = [
    columnHelper.accessor("type", {
        header: "Type",
        enableSorting: false,
        cell: function (props) { return (React.createElement(Input, { size: "sm", "aria-label": "Type input", defaultValue: props.getValue() })); }
    }),
    columnHelper.accessor("price", {
        header: "Price",
        enableSorting: false,
        cell: function (props) { return (React.createElement(Input, { size: "sm", "aria-label": "Price input", defaultValue: props.getValue() })); }
    }),
];
export var EditableTemplate = function (_a) {
    var _ = _a.name, args = __rest(_a, ["name"]);
    var items = __spreadArray([], data, true);
    return (React.createElement(Box, { maxW: "512px", p: 4, bg: "neutral.50" },
        React.createElement(Table, { name: "table", data: items, columns: editableTableColumns })));
};
export var WithEditableCells = EditableTemplate.bind({});
