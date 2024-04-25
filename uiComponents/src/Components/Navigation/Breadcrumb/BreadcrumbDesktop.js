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
import { Breadcrumb as ChakraBreadcrumb, BreadcrumbItem as ChakraBreadcrumbItem, BreadcrumbLink as ChakraBreadcrumbLink, Link as ChakraLink, Menu, MenuButton, Skeleton as ChakraSkeleton, } from "@chakra-ui/react";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { omit as _omit } from "lodash";
import { CaretRight, DotsThree } from "@phosphor-icons/react";
import { Dropdown, DropdownItem } from "@Components/DataDisplay/Dropdown";
var DEFAULT_MENU_BUTTON_LABEL = "...";
var HiddenItems = function (_a) {
    var items = _a.items;
    var menu = useChakraMultiStyleConfig("Breadcrumb").menu;
    return (React.createElement(Menu, { "data-testid": "breadcrumb-menu" },
        React.createElement(MenuButton, { "data-testid": "breadcrumb-menu-button", sx: menu },
            React.createElement(PhosphorIcon, { as: DotsThree, size: "xs" })),
        React.createElement(Dropdown, { "data-testid": "breadcrumb-dropdown" }, items === null || items === void 0 ? void 0 : items.map(function (item) { return (React.createElement(DropdownItem, __assign({ label: item.label, key: item.label }, (typeof item.link === "string"
            ? { as: ChakraLink, href: item.link }
            : __assign({}, item.link))), item.label)); }))));
};
export var BreadcrumbDesktop = forwardRef(function (props, ref) {
    var items = props.items, showMaxItems = props.showMaxItems, variant = props.variant;
    var styles = useChakraMultiStyleConfig("Breadcrumb", {
        variant: variant
    });
    var containerProps = _omit(props, ["items", "showMaxItems", "variant"]);
    var getCustomList = function () {
        var hiddenItems = {
            as: HiddenItems,
            items: items.slice(2, -2)
        };
        var list = __spreadArray(__spreadArray(__spreadArray([], items.slice(0, 2), true), [
            { label: DEFAULT_MENU_BUTTON_LABEL, link: hiddenItems }
        ], false), items.slice(-2), true);
        return list;
    };
    var customList = showMaxItems ? getCustomList() : items;
    return (React.createElement(ChakraBreadcrumb, __assign({ "data-testid": "breadcrumb-desktop", ref: ref, separator: React.createElement(PhosphorIcon, { as: CaretRight }), spacing: 2, sx: styles.container }, containerProps), customList.map(function (item, index) { return (React.createElement(ChakraBreadcrumbItem, { isCurrentPage: customList.length === index + 1, key: item.label, sx: styles.item }, item.isLoading ? (React.createElement(ChakraSkeleton, { "data-testid": "breadcrumb-loading-item", minH: 2, minW: 20 })) : (React.createElement(ChakraBreadcrumbLink, __assign({}, (typeof item.link === "string"
        ? { href: item.link }
        : __assign({}, item.link)), { sx: styles.link }), item.label)))); })));
});
