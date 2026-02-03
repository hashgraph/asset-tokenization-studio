// SPDX-License-Identifier: Apache-2.0

import { Button, useStepContext } from "io-bricks-ui";
import type { ButtonProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";

export const PreviousStepButton = (props: ButtonProps) => {
  const { t } = useTranslation("importAsset", { keyPrefix: "buttons" });

  const { goToPrevious } = useStepContext();

  return (
    <Button
      w="123px"
      h="40px"
      data-testid="previous-step-button"
      size="md"
      variant="secondary"
      onClick={goToPrevious}
      {...props}
    >
      {t("previousStep")}
    </Button>
  );
};
