import { render } from "@/test-utils";
import { Airplane } from "@phosphor-icons/react";
import React from "react";
import { Weight, PhosphorIcon } from "./PhosphorIcon";
describe("<PhosphorIcon />", function () {
    var factoryComponent = function (_a) {
        var _b = _a === void 0 ? {} : _a, as = _b.as;
        return render(React.createElement(PhosphorIcon, { as: as }));
    };
    test("renders correctly", function () {
        var component = factoryComponent({ as: Airplane });
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("renders correctly when passing weight", function () {
        var component = factoryComponent({ as: Airplane, weight: Weight.Bold });
        expect(component.asFragment()).toMatchSnapshot("WithWeight");
    });
    test("throws error correctly when no icon is passed", function () {
        expect(function () { return factoryComponent(); }).toThrow("Icon was not provided in prop `as`.");
    });
});
