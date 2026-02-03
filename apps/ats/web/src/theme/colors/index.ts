// SPDX-License-Identifier: Apache-2.0

import { adminUIColors } from "./adminUIColors";
import { alternativeColors } from "./alternativeColors";
import { holderUIColors } from "./holderUIColors";
import { mainColors } from "./mainColors";
import { neutralColors } from "./neutralColors";
import { statusColors } from "./statusColors";

export * from "./adminUIColors";
export * from "./alternativeColors";
export * from "./holderUIColors";
export * from "./mainColors";
export * from "./neutralColors";
export * from "./statusColors";

export type AdminUIColors = keyof typeof adminUIColors;
export type AlternativeColors = keyof typeof alternativeColors;
export type HolderUIColors = keyof typeof holderUIColors;
export type MainColors = keyof typeof mainColors;
export type NeutralColors = keyof typeof neutralColors;
export type StatusColors = keyof typeof statusColors;

export const colors = {
  adminUI: adminUIColors,
  alt: alternativeColors,
  holderUI: holderUIColors,
  neutral: neutralColors,
  status: statusColors,
  ...mainColors,
};
