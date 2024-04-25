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
import { Title, Subtitle, Story } from "@storybook/addon-docs";
import { Link, Flex } from "@chakra-ui/react";
import { PageTitle } from "@Components/Navigation/PageTitle";
var props = {
    title: "Page Title",
    onGoBack: undefined
};
export default {
    title: "Design System/Navigation/PageTitle",
    component: PageTitle,
    args: {
        isLoading: false
    },
    parameters: {
        docs: {
            page: function () { return (React.createElement(React.Fragment, null,
                React.createElement(Title, null, "Molecules & Organisms: Navigation"),
                React.createElement(Subtitle, null, "Page Title with back button"),
                React.createElement(Flex, { margin: "50px 0" },
                    React.createElement(Story, { id: "design-system-navigation-pagetitle--with-back-button" })),
                React.createElement(Link, { href: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=2091-20098&t=7YJ1vWLNVVuMBa0t-0", isExternal: true }, "View figma design"))); }
        }
    }
};
var Template = function (args) { return React.createElement(PageTitle, __assign({}, args)); };
export var WithBackButton = Template.bind({});
WithBackButton.args = __assign(__assign({}, props), { onGoBack: function () {
        alert("Go back");
    } });
export var WithoutBackButton = Template.bind({});
WithoutBackButton.args = __assign({}, props);
export var WithLoading = Template.bind({});
WithLoading.args = __assign(__assign({}, props), { onGoBack: function () {
        alert("Go back");
    }, isLoading: true });
