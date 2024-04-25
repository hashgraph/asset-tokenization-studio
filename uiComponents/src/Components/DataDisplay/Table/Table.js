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
var _a;
import { Box, Center, Flex } from "@chakra-ui/layout";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import { createContext } from "@chakra-ui/react-context";
import { Table as ChakraTable, Tbody, Tr, Skeleton, Td, } from "@chakra-ui/react";
import React, { Fragment, useMemo } from "react";
import { flexRender, getCoreRowModel, getExpandedRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { TableRow } from "./components/TableRow";
import { SortIcon } from "./components/SortIcon";
import { TableFooter } from "./components/TableFooter";
export var tablePartsList = [
    "header",
    "headerContainer",
    "cell",
    "rowContainer",
    "container",
    "tableContainer",
    "title",
    "subtext",
    "sortIcon",
    "empty",
    "rowExpander",
    "rowContainerExpanded",
    "cellIcon",
    "headerIcon",
];
export var Table = function (_a) {
    var data = _a.data, columns = _a.columns, variant = _a.variant, size = _a.size, sorting = _a.sorting, setSorting = _a.setSorting, setPagination = _a.setPagination, pagination = _a.pagination, totalPages = _a.totalPages, totalElements = _a.totalElements, onClickRow = _a.onClickRow, onMouseOverRow = _a.onMouseOverRow, onMouseLeaveRow = _a.onMouseLeaveRow, name = _a.name, _b = _a.showFooter, showFooter = _b === void 0 ? true : _b, _c = _a.defaultColumnSize, defaultColumnSize = _c === void 0 ? 138 : _c, isLoading = _a.isLoading, loadingColumnsCount = _a.loadingColumnsCount, _d = _a.noOfLines, noOfLines = _d === void 0 ? 1 : _d, emptyComponent = _a.emptyComponent, enableExpanding = _a.enableExpanding, RowExpandedContent = _a.rowExpandedContent, allowMultiExpand = _a.allowMultiExpand, props = __rest(_a, ["data", "columns", "variant", "size", "sorting", "setSorting", "setPagination", "pagination", "totalPages", "totalElements", "onClickRow", "onMouseOverRow", "onMouseLeaveRow", "name", "showFooter", "defaultColumnSize", "isLoading", "loadingColumnsCount", "noOfLines", "emptyComponent", "enableExpanding", "rowExpandedContent", "allowMultiExpand"]);
    var processedColumns = useMemo(function () {
        return isLoading
            ? columns.map(function (col) { return (__assign(__assign({}, col), { cell: function () { return React.createElement(Skeleton, { height: 2, w: "full" }); } })); })
            : columns;
    }, [columns, isLoading]);
    var processedData = useMemo(function () { return (isLoading ? Array(loadingColumnsCount).fill({}) : data || []); }, [data, isLoading, loadingColumnsCount]);
    var table = useReactTable({
        columns: processedColumns,
        data: processedData,
        defaultColumn: {
            size: defaultColumnSize
        },
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        enableExpanding: enableExpanding,
        getExpandedRowModel: getExpandedRowModel(),
        onPaginationChange: setPagination,
        pageCount: totalPages !== null && totalPages !== void 0 ? totalPages : -1,
        state: {
            sorting: sorting,
            pagination: pagination
        },
        manualSorting: true,
        manualPagination: true
    });
    var styles = useChakraMultiStyleConfig("Table", {
        variant: variant,
        size: size,
        isLoading: isLoading
    });
    var headerGroup = table.getHeaderGroups()[0];
    var onClickSort = function (header, event) {
        table.setPageIndex(0);
        var setSort = header.column.getToggleSortingHandler();
        setSort === null || setSort === void 0 ? void 0 : setSort(event);
    };
    return (React.createElement(TableContextProvider, { value: __assign({ styles: styles, noOfLines: noOfLines, pagination: pagination, totalPages: totalPages, totalElements: totalElements, 
            // @ts-ignore TODO: context with generic?
            onClickRow: onClickRow, 
            // @ts-ignore
            onMouseOverRow: onMouseOverRow, 
            // @ts-ignore
            onMouseLeaveRow: onMouseLeaveRow, allowMultiExpand: allowMultiExpand, enableExpanding: enableExpanding }, table) },
        React.createElement(Box, __assign({}, props),
            React.createElement(Box, { sx: styles.container },
                React.createElement(ChakraTable, { "data-testid": "table-".concat(name), sx: styles.tableContainer },
                    React.createElement(Tbody, null,
                        React.createElement(Tr, { sx: styles.headerContainer },
                            enableExpanding && (React.createElement(Box, { key: "expander", as: "th", sx: styles.headerIcon })),
                            headerGroup.headers.map(function (header) { return (React.createElement(Box, { key: header.id, as: "th", w: header.getSize(), maxW: header.getSize(), sx: styles.header },
                                React.createElement(Flex, { alignItems: "center", justifyContent: "space-between" },
                                    React.createElement(Box, { noOfLines: noOfLines }, flexRender(header.column.columnDef.header, header.getContext())),
                                    header.column.getCanSort() && (React.createElement(SortIcon, { type: header.column.getIsSorted(), onSort: function (event) { return onClickSort(header, event); } }))))); })),
                        table.getRowModel().rows.map(function (row) {
                            return (React.createElement(Fragment, { key: row.id },
                                React.createElement(TableRow, { row: row }),
                                row.getIsExpanded() && RowExpandedContent && (React.createElement(Tr, null,
                                    React.createElement(Td, { colSpan: row.getVisibleCells().length + 1 },
                                        React.createElement(Box, { sx: styles.rowContainerExpanded },
                                            React.createElement(RowExpandedContent, { row: row })))))));
                        })))),
            emptyComponent && !isLoading && processedData.length === 0 && (React.createElement(Center, { sx: styles.empty }, emptyComponent)),
            showFooter && React.createElement(TableFooter, null))));
};
export var TableContextProvider = (_a = createContext({ name: "TableContext" }), _a[0]), useTableContext = _a[1];
