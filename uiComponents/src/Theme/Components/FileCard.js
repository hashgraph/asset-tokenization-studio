import { fileCardPartsList } from "@Components/DataDisplay/FileCard";
export var ConfigFileCard = {
    parts: fileCardPartsList,
    baseStyle: function (_a) {
        var isInvalid = _a.isInvalid;
        return ({
            container: {
                p: 4,
                borderStyle: "solid",
                borderColor: isInvalid ? "error.500" : "neutral.500",
                borderWidth: 1,
                borderRadius: 4,
                position: "relative"
            },
            name: {
                textStyle: "ElementsRegularSM",
                color: "neutral.900",
                maxW: "312px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
            },
            size: {
                textStyle: "ElementsRegularXS",
                color: isInvalid ? "error.500" : "neutral.800"
            }
        });
    }
};
