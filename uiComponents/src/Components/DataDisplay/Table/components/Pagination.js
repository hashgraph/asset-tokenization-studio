import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { IconButton } from "@Components/Interaction/IconButton";
import { Flex } from "@chakra-ui/react";
import { CaretCircleDoubleLeft, CaretCircleDoubleRight, CaretCircleLeft, CaretCircleRight, } from "@phosphor-icons/react";
import React from "react";
import { useTableContext } from "../Table";
export var Pagination = function () {
    var _a = useTableContext(), styles = _a.styles, totalPages = _a.totalPages, previousPage = _a.previousPage, getCanPreviousPage = _a.getCanPreviousPage, nextPage = _a.nextPage, getCanNextPage = _a.getCanNextPage, setPageIndex = _a.setPageIndex, getState = _a.getState, _b = _a.paginationText, paginationText = _b === void 0 ? "Page" : _b;
    var currentPage = getState().pagination.pageIndex;
    return (React.createElement(Flex, { align: "center" },
        React.createElement(IconButton, { size: "xs", variant: "tertiary", "aria-label": "Go to first page", onClick: function () { return setPageIndex(0); }, isDisabled: currentPage === 0, icon: React.createElement(PhosphorIcon, { size: "xxs", as: CaretCircleDoubleLeft }) }),
        React.createElement(IconButton, { size: "xs", variant: "tertiary", "aria-label": "Go to previous page", onClick: previousPage, isDisabled: !getCanPreviousPage(), icon: React.createElement(PhosphorIcon, { size: "xxs", as: CaretCircleLeft }) }),
        React.createElement(Text, { sx: styles.footerText },
            paginationText,
            " ",
            currentPage + 1,
            "/",
            totalPages),
        React.createElement(IconButton, { size: "xs", variant: "tertiary", "aria-label": "Go to next page", onClick: function () { return nextPage(); }, isDisabled: !getCanNextPage(), icon: React.createElement(PhosphorIcon, { size: "xxs", as: CaretCircleRight }) }),
        React.createElement(IconButton, { size: "xs", variant: "tertiary", "aria-label": "Go to last page", onClick: function () { return setPageIndex(totalPages - 1); }, isDisabled: currentPage === totalPages - 1, icon: React.createElement(PhosphorIcon, { size: "xxs", as: CaretCircleDoubleRight }) })));
};
