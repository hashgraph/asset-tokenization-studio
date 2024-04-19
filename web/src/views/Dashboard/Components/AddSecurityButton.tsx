import { PhosphorIcon } from "@iob/io-bricks-ui/Foundations";
import { Button } from "@iob/io-bricks-ui/Interaction";
import type { ButtonProps } from "@iob/io-bricks-ui/Interaction";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { Link as RouterLink } from "react-router-dom";
import { Plus } from "@phosphor-icons/react";

export const AddSecurityButton = (props: ButtonProps) => {
  const { t } = useTranslation("routes");

  return (
    <Button
      data-testid="add-security-button"
      as={RouterLink}
      to={RouterManager.getUrl(RouteName.AddSecurity)}
      size="md"
      variant="secondary"
      leftIcon={<PhosphorIcon as={Plus} />}
      {...props}
    >
      {t(RouteName.AddSecurity)}
    </Button>
  );
};
