import { IconButton } from "@Components/Interaction/IconButton";
import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import { CustomIcon } from "@/Components";
export var SortIcon = function (_a) {
    var type = _a.type, onSort = _a.onSort;
    var isSorted = !!type;
    var styles = useChakraMultiStyleConfig("Table", {
        isSorted: isSorted,
        typeOfSort: type
    });
    return (React.createElement(IconButton, { "aria-label": "Sort", size: "xs", onClick: onSort, variant: "tertiary", icon: React.createElement(CustomIcon, { name: "SortingIcon", w: 4, h: 4, sx: styles.sortIcon }) }));
};
