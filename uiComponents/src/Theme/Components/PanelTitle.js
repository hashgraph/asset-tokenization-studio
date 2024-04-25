import { panelTitlePartsList, } from "@/Components/DataDisplay/PanelTitle";
export var ConfigPanelTitle = {
    parts: panelTitlePartsList,
    baseStyle: {
        container: {
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid",
            borderBottomColor: "neutral.300",
            pl: 2,
            pb: 4,
            w: "full"
        },
        title: {
            apply: "textStyles.ElementsSemiboldMD",
            color: "neutral.900"
        }
    }
};
