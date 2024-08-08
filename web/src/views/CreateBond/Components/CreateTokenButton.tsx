import { Button } from "@hashgraph/asset-tokenization-uicomponents/Interaction";
import type { ButtonProps } from "@hashgraph/asset-tokenization-uicomponents/Interaction";
import { useTranslation } from "react-i18next";

export const CreateTokenButton = (props: ButtonProps) => {
  const { t } = useTranslation("security", { keyPrefix: "createBond" });

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
