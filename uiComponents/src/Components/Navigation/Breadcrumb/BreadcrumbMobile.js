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
import React from "react";
import { Breadcrumb as ChakraBreadcrumb, BreadcrumbItem as ChakraBreadcrumbItem, BreadcrumbLink as ChakraBreadcrumbLink, BreadcrumbSeparator as ChakraBreadcrumbSeparator, Skeleton as ChakraSkeleton, } from "@chakra-ui/react";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { omit as _omit } from "lodash";
import { CaretLeft } from "@phosphor-icons/react";
export var BreadcrumbMobile = forwardRef(function (props, ref) {
    var items = props.items, variant = props.variant;
    var item = items[items.length - 2];
    var styles = useChakraMultiStyleConfig("Breadcrumb", {
        variant: variant
    });
    var containerProps = _omit(props, [
        "buttonLabel",
        "items",
        "showMaxItems",
        "variant",
    ]);
    return (React.createElement(ChakraBreadcrumb, __assign({ "data-testid": "breadcrumb-mobile", ref: ref, separator: React.createElement(PhosphorIcon, { as: CaretLeft }), sx: styles.container }, containerProps),
        React.createElement(ChakraBreadcrumbItem, { key: item.label, sx: styles.item },
            React.createElement(ChakraBreadcrumbSeparator, { ml: 0, sx: styles.separator }),
            item.isLoading ? (React.createElement(ChakraSkeleton, { "data-testid": "breadcrumb-loading-item", minH: 2, minW: 20 })) : (React.createElement(ChakraBreadcrumbLink, __assign({ "data-testid": "breadcrumb-link" }, (typeof item.link === "string"
                ? { href: item.link }
                : __assign({}, item.link)), { sx: styles.link }), item.label)))));
});
