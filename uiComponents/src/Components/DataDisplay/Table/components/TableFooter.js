import { Text } from "@/Components/Foundations/Text";
import { Flex } from "@chakra-ui/react";
import React from "react";
import { useTableContext } from "../Table";
import { Pagination } from "./Pagination";
export var TableFooter = function () {
    var _a = useTableContext(), styles = _a.styles, totalElements = _a.totalElements, pagination = _a.pagination, _b = _a.totalElementsText, totalElementsText = _b === void 0 ? totalElements > 1 ? "records found" : "record found" : _b;
    if (!totalElements)
        return React.createElement(React.Fragment, null);
    return (React.createElement(Flex, { justify: "space-between", mt: 4 },
        (pagination === null || pagination === void 0 ? void 0 : pagination.pageSize) && React.createElement(Pagination, null),
        React.createElement(Text, { sx: styles.footerText },
            totalElements,
            " ",
            totalElementsText)));
};
