// SPDX-License-Identifier: Apache-2.0

import { DetailReviewThemeConfiguration, detailReviewPartsList } from "io-bricks-ui";

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
