// SPDX-License-Identifier: Apache-2.0

import { Button } from "io-bricks-ui";
import type { ButtonProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { Link as RouterLink } from "react-router-dom";

export const CreateNewSecurityButton = (props: ButtonProps) => {
  const { t } = useTranslation("dashboard", { keyPrefix: "commons" });

  return (
    <Button
      data-testid="create-new-security-button"
      as={RouterLink}
      to={RouterManager.getUrl(RouteName.CreateSecurity)}
      size="md"
      {...props}
    >
      {t("createNewSecurity")}
    </Button>
  );
};
