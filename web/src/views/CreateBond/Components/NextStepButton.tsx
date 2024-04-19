import { Button } from "@iob/io-bricks-ui/Interaction";
import type { ButtonProps } from "@iob/io-bricks-ui/Interaction";
import { useTranslation } from "react-i18next";
import { useStepContext } from "@iob/io-bricks-ui/Indicators";

export const NextStepButton = (props: ButtonProps) => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });

  const { goToNext } = useStepContext();

  return (
    <Button
      w="97px"
      h="40px"
      data-testid="next-step-button"
      size="md"
      variant="primary"
      onClick={goToNext}
      {...props}
    >
      {t("nextStepButton")}
    </Button>
  );
};
