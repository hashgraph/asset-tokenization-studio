// SPDX-License-Identifier: Apache-2.0

import { Button } from "io-bricks-ui";
import type { ButtonProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { Link as RouterLink } from "react-router-dom";

export const CreateNewExternalPauseButton = (props: ButtonProps) => {
  const { t: tHeader } = useTranslation("externalPause", {
    keyPrefix: "list.header",
  });

  return (
    <Button
      data-testid="create-external-pause-list-button"
      as={RouterLink}
      to={RouterManager.getUrl(RouteName.CreateExternalPause)}
      size="md"
      {...props}
    >
      {tHeader("createNewExternalPause")}
    </Button>
  );
};
