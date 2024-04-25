import React from "react";
import { PopUpText, PopUpIcon } from "./components";
import { usePopupContext } from "./context/PopupContext";
export var DefaultPopup = function () {
    var _a = usePopupContext(), description = _a.description, title = _a.title, icon = _a.icon;
    return (React.createElement(React.Fragment, null,
        icon && React.createElement(PopUpIcon, { icon: icon }),
        title && React.createElement(PopUpText, { label: title, type: "title" }),
        description && React.createElement(PopUpText, { label: description, type: "description" })));
};
