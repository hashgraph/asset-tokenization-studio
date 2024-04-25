import { render } from "@/test-utils";
import React from "react";
import { Dropdown } from "./Dropdown";
import { Menu } from "@chakra-ui/react";
import { DropdownItem } from "./Components";
describe("<Dropdown />", function () {
    var factoryComponent = function (props) {
        return render(React.createElement(Menu, { isOpen: true },
            React.createElement(Dropdown, null,
                React.createElement(DropdownItem, { label: "Dropdow Item", isActive: true }),
                React.createElement(DropdownItem, { label: "Dropdow Item" }),
                React.createElement(DropdownItem, { label: "Dropdow Item" }),
                React.createElement(DropdownItem, { label: "Dropdow Item" }))));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.getAllByTestId("dropdown-item")).toHaveLength(4);
        expect(component.asFragment()).toMatchSnapshot();
    });
});
