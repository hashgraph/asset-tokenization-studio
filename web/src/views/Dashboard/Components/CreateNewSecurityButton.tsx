import { Button } from "@iob/io-bricks-ui/Interaction";
import type { ButtonProps } from "@iob/io-bricks-ui/Interaction";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { Link as RouterLink } from "react-router-dom";

export const CreateNewSecurityButton = (props: ButtonProps) => {
  const { t } = useTranslation("dashboard", { keyPrefix: "commons" });

  return (
    <Button
      data-testid="create-new-security-button"
      as={RouterLink}
      to={RouterManager.getUrl(RouteName.CreateSecurity)}
      size="md"
      {...props}
    >
      {t("createNewSecurity")}
    </Button>
  );
};
