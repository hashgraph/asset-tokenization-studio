import { pageTitlePartsList } from "@/Components/Navigation/PageTitle";
export var ConfigPageTitle = {
    parts: pageTitlePartsList,
    baseStyle: {
        container: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap"
        },
        backButton: {
            marginRight: "24px",
            height: "40px",
            width: "40px"
        },
        textTitle: {
            apply: "textStyles.HeadingBoldXL",
            color: "neutral.800",
            lineHeight: "32px"
        }
    }
};
