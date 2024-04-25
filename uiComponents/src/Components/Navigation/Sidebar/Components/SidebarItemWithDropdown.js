import { Box as ChakraBox, Menu as ChakraMenu, MenuButton as ChakraMenuButton, MenuList as ChakraMenuList, Stack as ChakraStack, useDisclosure as useChakraDisclosure, } from "@chakra-ui/react";
import React from "react";
import { SidebarItem } from "./SidebarItem";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
export var sidebarDropdownPartsList = [
    "header",
    "wrapper",
    "container",
    "itemIconWeight",
    "itemLabel",
    "itemContainer",
];
export var SidebarItemWithDropdown = function (_a) {
    var label = _a.label, header = _a.header, icon = _a.icon, children = _a.children, isActive = _a.isActive, isDisabled = _a.isDisabled;
    var styles = useChakraMultiStyleConfig("SidebarDropdown", {
        hasHeader: !!header
    });
    var _b = useChakraDisclosure(), isOpen = _b.isOpen, onOpen = _b.onOpen, onClose = _b.onClose;
    return (React.createElement(ChakraMenu, { placement: "right-start", gutter: 0, isOpen: isOpen },
        React.createElement(ChakraMenuButton, { onMouseEnter: onOpen, onMouseLeave: onClose, as: SidebarItem, label: label, icon: icon, isActive: isActive, isDisabled: isDisabled }),
        React.createElement(ChakraMenuList, { position: "relative", sx: styles.wrapper, onMouseEnter: onOpen, onMouseLeave: onClose },
            header && (React.createElement(ChakraBox, { "data-testid": "sidebar-dropdown-header", sx: styles.header }, header)),
            React.createElement(ChakraStack, { spacing: 1, sx: styles.container }, children))));
};
