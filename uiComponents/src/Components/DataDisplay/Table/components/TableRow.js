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
import { IconButton, PhosphorIcon } from "@/Components";
import { Box, Td, Tr } from "@chakra-ui/react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { flexRender } from "@tanstack/react-table";
import React from "react";
import { useTableContext } from "../Table";
export var TableRow = function (_a) {
    var row = _a.row;
    var _b = useTableContext(), styles = _b.styles, noOfLines = _b.noOfLines, onClickRow = _b.onClickRow, onMouseOverRow = _b.onMouseOverRow, onMouseLeaveRow = _b.onMouseLeaveRow, allowMultiExpand = _b.allowMultiExpand, resetExpanded = _b.resetExpanded, enableExpanding = _b.enableExpanding;
    var handleClick = function (e) {
        var rowIsClosed = !row.getIsExpanded();
        e.stopPropagation();
        if (!allowMultiExpand)
            resetExpanded();
        rowIsClosed ? row.toggleExpanded(true) : row.toggleExpanded(false);
    };
    return (React.createElement(Tr, { "data-testid": "row-".concat(row === null || row === void 0 ? void 0 : row.index), key: row.id, w: "full", onClick: function () { return onClickRow === null || onClickRow === void 0 ? void 0 : onClickRow(row.original); }, onMouseOver: function () { return onMouseOverRow === null || onMouseOverRow === void 0 ? void 0 : onMouseOverRow(row.original); }, onMouseLeave: function () { return onMouseLeaveRow === null || onMouseLeaveRow === void 0 ? void 0 : onMouseLeaveRow(row.original); }, cursor: onClickRow ? "pointer" : "default", sx: styles.rowContainer },
        enableExpanding && (React.createElement(Td, { key: "expander-".concat(row === null || row === void 0 ? void 0 : row.index), sx: styles.cellIcon },
            React.createElement(IconButton, { "aria-label": "expand-button", icon: React.createElement(PhosphorIcon, { as: row.getIsExpanded() ? CaretUp : CaretDown }), onClick: handleClick, sx: styles.rowExpander }))),
        row.getVisibleCells().map(function (cell) {
            var _a, _b;
            var isFocusable = (_b = (_a = cell.column.columnDef.meta) === null || _a === void 0 ? void 0 : _a.isFocusable) !== null && _b !== void 0 ? _b : false;
            return (React.createElement(Td, __assign({ key: cell.id, minW: cell.column.getSize(), sx: styles.cell }, (isFocusable && {
                tabIndex: 0
            })),
                React.createElement(Box, { noOfLines: noOfLines }, flexRender(cell.column.columnDef.cell, cell.getContext()))));
        })));
};
