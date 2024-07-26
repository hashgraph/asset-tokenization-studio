import { Button } from "@hashgraph/assettokenization-uicomponents/Interaction";
import type { ButtonProps } from "@hashgraph/assettokenization-uicomponents/Interaction";
import { useTranslation } from "react-i18next";
import { useStepContext } from "@hashgraph/assettokenization-uicomponents/Indicators";

export const PreviousStepButton = (props: ButtonProps) => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });

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
      {t("previousStepButton")}
    </Button>
  );
};
