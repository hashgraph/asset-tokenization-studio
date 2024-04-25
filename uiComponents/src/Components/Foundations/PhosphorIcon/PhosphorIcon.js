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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useStyleConfig as useChakraStyleConfig } from "@chakra-ui/react";
import { Icon } from "@/Components/Foundations/Icon";
import { merge as _merge } from "lodash";
import React from "react";
export var Weight;
(function (Weight) {
    Weight["Thin"] = "thin";
    Weight["Light"] = "light";
    Weight["Regular"] = "regular";
    Weight["Bold"] = "bold";
    Weight["Fill"] = "fill";
    Weight["Duotone"] = "duotone";
})(Weight || (Weight = {}));
export var PhosphorIcon = function (_a) {
    var weight = _a.weight, size = _a.size, variant = _a.variant, as = _a.as, __css = _a.__css, props = __rest(_a, ["weight", "size", "variant", "as", "__css"]);
    if (!as) {
        throw new Error("Icon was not provided in prop `as`.");
    }
    var _b = useChakraStyleConfig("PhosphorIcon", {
        size: size,
        variant: variant
    }), _c = _b.weight, themeWeight = _c === void 0 ? Weight.Regular : _c, themeStyles = __rest(_b, ["weight"]);
    var styles = _merge(themeStyles, __css);
    var iconWeight = weight || themeWeight;
    return React.createElement(Icon, __assign({ as: as, weight: iconWeight, __css: styles }, props));
};
