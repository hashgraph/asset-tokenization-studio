// SPDX-License-Identifier: Apache-2.0

import { mainColors } from "./mainColors";
import { neutralColors } from "./neutralColors";
import { statusColors } from "./statusColors";

export * from "./mainColors";
export * from "./neutralColors";
export * from "./statusColors";

export type MainColors = keyof typeof mainColors;
export type NeutralColors = keyof typeof neutralColors;
export type StatusColors = keyof typeof statusColors;

export const colors = {
  neutral: neutralColors,
  status: statusColors,
  ...mainColors,
};
