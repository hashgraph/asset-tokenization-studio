import {
  DetailReviewThemeConfiguration,
  detailReviewPartsList,
} from "@hashgraph/uiComponents/DataDisplay";

export const DetailReview: DetailReviewThemeConfiguration = {
  parts: detailReviewPartsList,
  baseStyle: {
    container: {
      flexDirection: "column",
      gap: 2,
    },
    title: {
      color: "neutral.white",
      textStyle: "BodyRegularSM",
    },
    value: {
      color: "neutral.light.200",
      textStyle: "HeadingMediumMD",
    },
  },
};
