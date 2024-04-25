import { detailReviewPartsList } from "@Components/DataDisplay/DetailReview";
export var ConfigDetailReview = {
    parts: detailReviewPartsList,
    baseStyle: {
        container: {
            flexDirection: "column",
            gap: 2
        },
        title: {
            color: "neutral.900",
            textStyle: "HeadingMediumMD"
        },
        value: {
            color: "neutral.700",
            textStyle: "ElementsRegularSM"
        }
    }
};
