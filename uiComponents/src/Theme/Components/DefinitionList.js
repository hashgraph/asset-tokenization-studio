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
import { definitionListPartsList, } from "@Components/DataDisplay/DefinitionList";
import { textStyles } from "../textStyles";
export var DefinitionListThemeConfig = {
    parts: definitionListPartsList,
    baseStyle: function (_a) {
        var columns = _a.columns;
        return ({
            listTitle: __assign({}, textStyles.ElementsSemiboldMD),
            listItem: {
                py: 4,
                px: 2,
                borderBottom: "1px solid",
                borderColor: "neutral.300",
                alignItems: "center",
                width: "full"
            },
            definitionListGrid: {
                gridTemplateColumns: "repeat(".concat(columns, ", 1fr)"),
                gap: "5%"
            },
            listItemTitle: __assign(__assign({}, textStyles.ElementsSemiboldSM), { color: "neutral.900", mr: 4, alignSelf: "center" }),
            listItemDescription: __assign(__assign({}, textStyles.ElementsRegularSM), { alignSelf: "center", color: "neutral.900", mr: 1 })
        });
    }
};
