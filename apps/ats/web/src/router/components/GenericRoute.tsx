// SPDX-License-Identifier: Apache-2.0

import { Navigate } from "react-router-dom";
import { RoutePath } from "../RoutePath";

export const GenericRoute = () => {
  return <Navigate to={RoutePath.LANDING} replace />;
};
