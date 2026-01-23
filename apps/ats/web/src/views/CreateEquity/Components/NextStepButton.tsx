// SPDX-License-Identifier: Apache-2.0

import { Button, useStepContext } from "io-bricks-ui";
import type { ButtonProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";

export const NextStepButton = (props: ButtonProps) => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });

  const { goToNext } = useStepContext();

  return (
    <Button w="97px" h="40px" data-testid="next-step-button" size="md" variant="primary" onClick={goToNext} {...props}>
      {t("nextStepButton")}
    </Button>
  );
};
