import React from "react";
export var PopupContext = React.createContext({});
export var usePopupContext = function () { return React.useContext(PopupContext); };
