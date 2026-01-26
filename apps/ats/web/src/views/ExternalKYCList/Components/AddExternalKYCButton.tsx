// SPDX-License-Identifier: Apache-2.0

import { PhosphorIcon, Button } from "io-bricks-ui";
import type { ButtonProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { Link as RouterLink } from "react-router-dom";
import { Plus } from "@phosphor-icons/react";

export const AddExternalKYCButton = (props: ButtonProps) => {
  const { t } = useTranslation("routes");

  return (
    <Button
      data-testid="add-external-KYC-button"
      as={RouterLink}
      to={RouterManager.getUrl(RouteName.AddExternalKYC)}
      size="md"
      variant="secondary"
      leftIcon={<PhosphorIcon as={Plus} />}
      {...props}
    >
      {t(RouteName.AddExternalKYC)}
    </Button>
  );
};
