// SPDX-License-Identifier: Apache-2.0

import { Button } from "io-bricks-ui";
import type { ButtonProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";

export const CreateTokenButton = (props: ButtonProps) => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });

  return (
    <Button data-testid="create-token-button" size="md" variant="primary" {...props}>
      {t("createTokenButton")}
    </Button>
  );
};
