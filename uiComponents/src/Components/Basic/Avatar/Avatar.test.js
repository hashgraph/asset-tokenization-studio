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
import { render } from "@testing-library/react";
import React from "react";
import { Avatar } from "./Avatar";
describe("<Avatar />", function () {
    var showBadge = true;
    var badgeColor = "red.500";
    var name = "John Doe";
    var src = "https://placekitten.com/200/200";
    var size2xs = { size: "2xs" };
    var sizeXs = { size: "xs" };
    var sizeSm = { size: "sm" };
    var sizeMd = { size: "md" };
    var sizeLg = { size: "lg" };
    var sizeXl = { size: "xl" };
    var size2Xl = { size: "2xl" };
    var size3Xl = { size: "3xl" };
    var factoryComponent = function (props) {
        return render(React.createElement(Avatar, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent({});
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("renders correctly with size 2xs", function () {
        var component = factoryComponent(size2xs);
        expect(component.asFragment()).toMatchSnapshot("Using size 2xs");
    });
    test("renders correctly with size xs", function () {
        var component = factoryComponent(sizeXs);
        expect(component.asFragment()).toMatchSnapshot("Using size xs");
    });
    test("renders correctly with size sm", function () {
        var component = factoryComponent(sizeSm);
        expect(component.asFragment()).toMatchSnapshot("Using size sm");
    });
    test("renders correctly with size md", function () {
        var component = factoryComponent(sizeMd);
        expect(component.asFragment()).toMatchSnapshot("Using size md");
    });
    test("renders correctly with size lg", function () {
        var component = factoryComponent(sizeLg);
        expect(component.asFragment()).toMatchSnapshot("Using size lg");
    });
    test("renders correctly with size xl", function () {
        var component = factoryComponent(sizeXl);
        expect(component.asFragment()).toMatchSnapshot("Using size xl");
    });
    test("renders correctly with size 2xl", function () {
        var component = factoryComponent(size2Xl);
        expect(component.asFragment()).toMatchSnapshot("Using size 2xl");
    });
    test("renders correctly with size 3xl", function () {
        var component = factoryComponent(size3Xl);
        expect(component.asFragment()).toMatchSnapshot("Using size 3xl");
    });
    test("renders correctly with initials", function () {
        var component = factoryComponent({ name: name });
        expect(component.asFragment()).toMatchSnapshot("Using initials");
    });
    test("renders correctly with image", function () {
        var component = factoryComponent({ src: src });
        expect(component.asFragment()).toMatchSnapshot("Using image");
    });
    test("renders correctly with badge default color", function () {
        var component = factoryComponent({ showBadge: showBadge });
        expect(component.asFragment()).toMatchSnapshot("Using badge default color");
    });
    test("renders correctly with badge custom color", function () {
        var component = factoryComponent({ showBadge: showBadge, badgeColor: badgeColor });
        expect(component.asFragment()).toMatchSnapshot("Using badge custom color");
    });
    test("renders correctly with initials and badge default color", function () {
        var component = factoryComponent({ name: name, showBadge: showBadge });
        expect(component.asFragment()).toMatchSnapshot("Using initials and badge default color");
    });
    test("renders correctly with initials and badge custom color", function () {
        var component = factoryComponent({ name: name, showBadge: showBadge, badgeColor: badgeColor });
        expect(component.asFragment()).toMatchSnapshot("Using initials and badge custom color");
    });
    test("renders correctly with image and badge default color", function () {
        var component = factoryComponent({ src: src, showBadge: showBadge });
        expect(component.asFragment()).toMatchSnapshot("Using image and badge default color");
    });
    test("renders correctly with image and badge custom color", function () {
        var component = factoryComponent({ src: src, showBadge: showBadge, badgeColor: badgeColor });
        expect(component.asFragment()).toMatchSnapshot("Using image and badge custom color");
    });
    test("renders correctly with isLoading", function () {
        var component = factoryComponent({ isLoading: true });
        expect(component.asFragment()).toMatchSnapshot("Using isLoading");
    });
});
