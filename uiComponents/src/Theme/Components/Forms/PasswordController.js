import { Icon } from "@/Components/Foundations/Icon";
import React from "react";
import { Eye, EyeClosed } from "@phosphor-icons/react";
export var ConfigPasswordController = {
    parts: ["iconShowPass", "iconHidePass"],
    baseStyle: function (_a) {
        var inputVariant = _a.inputVariant;
        return {
            iconShowPass: function () {
                return React.createElement(Icon, { as: Eye, color: "neutral.500" });
            },
            iconHidePass: function () {
                return React.createElement(Icon, { as: EyeClosed, color: "neutral.700" });
            }
        };
    }
};
