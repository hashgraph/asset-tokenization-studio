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
import { theme as chakraTheme } from "@chakra-ui/react";
import _ from "lodash";
import NeutralColors from "./neutralColors";
import StatusColors from "./statusColors";
import MainColors from "./mainColors";
import AlternativesColors from "./alternativesColors";
export { default as StatusColors } from "./statusColors";
export { default as MainColors } from "./mainColors";
export { default as NeutralColors } from "./neutralColors";
export { default as AlternativesColors } from "./alternativesColors";
export var getListFromColors = function (colors) {
    return Object.keys(colors).map(function (key) { return ({
        title: key === "white" ? "Neutral" : camelToFlat(key),
        subtitle: colors[key][500] ? "Base color: ".concat(key, ".500") : "",
        key: key,
        colors: _.isObject(colors[key]) ? colors[key] : [colors[key]]
    }); });
};
export var capitalize = function (s) {
    if (typeof s !== "string")
        return "";
    return _.camelCase(s);
};
export var camelToFlat = function (s) {
    if (typeof s !== "string")
        return "";
    return _.startCase(s)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, function (str) { return str.toUpperCase(); });
};
export var colors = __assign(__assign(__assign(__assign(__assign({}, chakraTheme.colors), NeutralColors), StatusColors), MainColors), AlternativesColors);
