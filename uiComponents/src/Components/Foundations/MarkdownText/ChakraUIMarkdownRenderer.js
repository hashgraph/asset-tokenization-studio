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
import { Checkbox } from "@chakra-ui/checkbox";
import { Image } from "@chakra-ui/image";
import { Code, Divider, Link, ListItem, OrderedList, UnorderedList, } from "@chakra-ui/layout";
import { chakra } from "@chakra-ui/system";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import _merge from "lodash/merge";
import * as React from "react";
import { Heading } from "../Heading";
import { Text } from "../Text";
function getCoreProps(props) {
    return props["data-sourcepos"]
        ? { "data-sourcepos": props["data-sourcepos"] }
        : {};
}
export var defaults = {
    p: function (props) {
        var children = props.children;
        return React.createElement(Text, { mb: 2 }, children);
    },
    em: function (props) {
        var children = props.children;
        return React.createElement(Text, { as: "em" }, children);
    },
    blockquote: function (props) {
        var children = props.children;
        return (React.createElement(Code, { as: "blockquote", p: 2 }, children));
    },
    code: function (props) {
        var inline = props.inline, children = props.children, className = props.className;
        if (inline) {
            return React.createElement(Code, { p: 2, children: children });
        }
        return (React.createElement(Code, { className: className, whiteSpace: "break-spaces", display: "block", w: "full", p: 2, children: children }));
    },
    del: function (props) {
        var children = props.children;
        return React.createElement(Text, { as: "del" }, children);
    },
    hr: function () {
        return React.createElement(Divider, null);
    },
    a: Link,
    img: Image,
    text: function (props) {
        var children = props.children;
        return React.createElement(Text, { as: "span" }, children);
    },
    ul: function (props) {
        var ordered = props.ordered, children = props.children, depth = props.depth;
        var attrs = getCoreProps(props);
        var Element = UnorderedList;
        var styleType = "disc";
        if (ordered) {
            Element = OrderedList;
            styleType = "decimal";
        }
        if (depth === 1)
            styleType = "circle";
        return (React.createElement(Element, __assign({ spacing: 2, as: ordered ? "ol" : "ul", styleType: styleType, pl: 4 }, attrs), children));
    },
    ol: function (props) {
        var ordered = props.ordered, children = props.children, depth = props.depth;
        var attrs = getCoreProps(props);
        var Element = UnorderedList;
        var styleType = "disc";
        if (ordered) {
            Element = OrderedList;
            styleType = "decimal";
        }
        if (depth === 1)
            styleType = "circle";
        return (React.createElement(Element, __assign({ spacing: 2, as: ordered ? "ol" : "ul", styleType: styleType, pl: 4 }, attrs), children));
    },
    li: function (props) {
        var children = props.children, checked = props.checked;
        var checkbox = null;
        if (checked !== null && checked !== undefined) {
            checkbox = (React.createElement(Checkbox, { isChecked: checked, isReadOnly: true }, children));
        }
        return (React.createElement(ListItem, __assign({}, getCoreProps(props), { listStyleType: checked !== null ? "none" : "inherit" }), checkbox || children));
    },
    heading: function (props) {
        var level = props.level, children = props.children;
        var sizes = ["2xl", "xl", "lg", "md", "sm", "xs"];
        return (React.createElement(Heading, __assign({ my: 4, 
            // @ts-ignore
            as: "h".concat(level), size: sizes[level - 1] }, getCoreProps(props)), children));
    },
    pre: function (props) {
        var children = props.children;
        return React.createElement(chakra.pre, __assign({}, getCoreProps(props)), children);
    },
    table: Table,
    thead: Thead,
    tbody: Tbody,
    tr: function (props) { return React.createElement(Tr, null, props.children); },
    td: function (props) { return React.createElement(Td, null, props.children); },
    th: function (props) { return React.createElement(Th, null, props.children); }
};
export function ChakraUIMarkdownRenderer(theme, merge) {
    if (merge === void 0) { merge = true; }
    var elements = {
        p: defaults.p,
        em: defaults.em,
        blockquote: defaults.blockquote,
        code: defaults.code,
        del: defaults.del,
        hr: defaults.hr,
        a: defaults.a,
        img: defaults.img,
        text: defaults.text,
        ul: defaults.ul,
        ol: defaults.ol,
        li: defaults.li,
        h1: defaults.heading,
        h2: defaults.heading,
        h3: defaults.heading,
        h4: defaults.heading,
        h5: defaults.heading,
        h6: defaults.heading,
        pre: defaults.pre,
        table: defaults.table,
        thead: defaults.thead,
        tbody: defaults.tbody,
        tr: defaults.tr,
        td: defaults.td,
        th: defaults.th
    };
    if (theme && merge) {
        return _merge(elements, theme);
    }
    return elements;
}
