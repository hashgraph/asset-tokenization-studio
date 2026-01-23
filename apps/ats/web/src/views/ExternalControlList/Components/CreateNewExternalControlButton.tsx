// SPDX-License-Identifier: Apache-2.0

import { Button } from "io-bricks-ui";
import type { ButtonProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { Link as RouterLink } from "react-router-dom";

export const CreateNewExternalControlButton = (props: ButtonProps) => {
  const { t: tHeader } = useTranslation("externalControl", {
    keyPrefix: "list.header",
  });

  return (
    <Button
      data-testid="create-external-pause-list-button"
      as={RouterLink}
      to={RouterManager.getUrl(RouteName.CreateExternalControl)}
      size="md"
      {...props}
    >
      {tHeader("createNewExternalControl")}
    </Button>
  );
};
