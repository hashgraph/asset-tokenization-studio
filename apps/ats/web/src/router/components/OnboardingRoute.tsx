// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { GenericRoute } from "./GenericRoute";

export const OnboardingRoute = ({ children }: { children: React.ReactElement }) => {
  const user = false;
  return !user ? children : <GenericRoute />;
};
