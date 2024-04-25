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
import { render } from "@/test-utils";
import { Cookie, Gear, House } from "@phosphor-icons/react";
import React from "react";
import { Sidebar } from "./Sidebar";
import { Stack } from "@chakra-ui/react";
import { SidebarItem } from "./Components/SidebarItem";
describe("<Sidebar />", function () {
    var defaultProps = {
        topContent: (React.createElement(Stack, { spacing: 6 },
            React.createElement(SidebarItem, { label: "Home", icon: House }),
            React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie, isActive: true }),
            React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie, isDisabled: true }))),
        bottomContent: React.createElement(SidebarItem, { label: "Configuration", icon: Gear })
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Sidebar, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("renders correctly only top content", function () {
        var component = factoryComponent({ topContent: defaultProps.topContent });
        expect(component.asFragment()).toMatchSnapshot("OnlyTopContent");
    });
    test("renders correctly only bottom content", function () {
        var component = factoryComponent({
            topContent: defaultProps.bottomContent
        });
        expect(component.asFragment()).toMatchSnapshot("OnlyBottomContent");
    });
});
