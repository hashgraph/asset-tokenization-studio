import { Button } from "@iob/io-bricks-ui/Interaction";
import type { ButtonProps } from "@iob/io-bricks-ui/Interaction";
import { useTranslation } from "react-i18next";
import { useStepContext } from "@iob/io-bricks-ui/Indicators";

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
