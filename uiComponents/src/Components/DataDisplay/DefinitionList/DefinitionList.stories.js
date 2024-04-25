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
import { DefinitionList, DefinitionListGrid } from "./index";
import { Link } from "@Components/Interaction/Link";
var items = [
    {
        title: "List Title",
        description: "List Description"
    },
    {
        title: "List Title",
        description: "List Description"
    },
    {
        title: "List Title",
        description: "List Description",
        canCopy: true
    },
];
var meta = {
    title: "Design System/Data Display/DefinitionList",
    component: DefinitionList,
    argTypes: {},
    parameters: {
        docs: {}
    },
    args: {
        title: "List Title",
        items: items,
        isLoading: false
    }
};
export default meta;
var Template = function (args) { return (React.createElement(DefinitionList, __assign({}, args))); };
var GridTemplate = function (args) { return (React.createElement(DefinitionListGrid, { columns: 2 },
    React.createElement(DefinitionList, __assign({}, args)),
    React.createElement(DefinitionList, __assign({}, args)))); };
export var Default = Template.bind({});
Default.args = {};
export var WithIsLoading = Template.bind({});
WithIsLoading.args = {
    isLoading: true
};
export var WithIsLoadingItem = Template.bind({});
WithIsLoadingItem.args = {
    items: __spreadArray([
        {
            title: "List Title",
            description: "List Description",
            isLoading: true
        }
    ], items, true)
};
export var GridDefinitionList = GridTemplate.bind({});
GridDefinitionList.args = {};
export var WithCustomDescriptions = Template.bind({});
WithCustomDescriptions.args = {
    items: [
        {
            title: "List Title",
            description: "List Description"
        },
        {
            title: "With link",
            description: React.createElement(Link, { href: "/" }, "link"),
            valueToCopy: "custom value copied",
            canCopy: true
        },
        {
            title: "List Title",
            description: "List Description",
            canCopy: true
        },
    ]
};
export var WithoutTitle = Template.bind({});
WithoutTitle.args = {
    title: undefined
};
