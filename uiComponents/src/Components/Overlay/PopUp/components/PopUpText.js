import React from "react";
import { Text } from "@chakra-ui/react";
import { usePopupContext } from "../context/PopupContext";
export var PopUpText = function (_a) {
    var _b = _a.type, type = _b === void 0 ? "title" : _b, label = _a.label;
    var popUpStyles = usePopupContext().styles;
    var _c = popUpStyles, _d = type, styles = _c[_d];
    if (typeof label === "object" || React.isValidElement(label)) {
        return React.createElement(React.Fragment, null, label);
    }
    return React.createElement(Text, { sx: styles }, label);
};
