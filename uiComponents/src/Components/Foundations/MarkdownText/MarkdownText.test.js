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
import React from "react";
import { Text } from "../Text";
import { MarkdownText } from "./MarkdownText";
describe("<MarkdownText />", function () {
    var children = "# h1 Heading 8-) \n  ## h2 Heading\n  ### h3 Heading\n  #### h4 Heading\n  ##### h5 Heading\n  ###### h6 Heading\n  Simple paragraph\n  ";
    var defaultProps = {
        children: children,
        theme: {
            p: function (props) { return React.createElement(Text, { color: "blue" }, props.children); }
        }
    };
    var factoryComponent = function (props) {
        return render(React.createElement(MarkdownText, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent(__assign({}, defaultProps));
        expect(component.asFragment()).toMatchSnapshot();
    });
});
