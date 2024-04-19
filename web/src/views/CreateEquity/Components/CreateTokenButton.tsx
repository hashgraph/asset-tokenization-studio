import { Button } from "@iob/io-bricks-ui/Interaction";
import type { ButtonProps } from "@iob/io-bricks-ui/Interaction";
import { useTranslation } from "react-i18next";

export const CreateTokenButton = (props: ButtonProps) => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });

  return (
    <Button
      data-testid="create-token-button"
      size="md"
      variant="primary"
      {...props}
    >
      {t("createTokenButton")}
    </Button>
  );
};
