// SPDX-License-Identifier: Apache-2.0

import { User } from "../../utils/constants";

export const getLayoutBg = {
  [User.admin]: "adminUI.50",
  [User.holder]: "holderUI.50",
  [User.general]: "neutral.50",
};

export const getAvatarBg = {
  [User.admin]: "adminUI.300",
  [User.holder]: "holderUI.300",
  [User.general]: "neutral.200",
};
