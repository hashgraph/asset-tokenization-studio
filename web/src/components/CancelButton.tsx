import { Button } from "@iob/io-bricks-ui/Interaction";
import type { ButtonProps } from "@iob/io-bricks-ui/Interaction";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../router/RouterManager";
import { RouteName } from "../router/RouteName";
import { Link as RouterLink } from "react-router-dom";

export const CancelButton = (props: ButtonProps) => {
  const { t: tGlobals } = useTranslation("globals");

  return (
    <Button
      data-testid="cancel-button"
      as={RouterLink}
      to={RouterManager.getUrl(RouteName.Dashboard)}
      size="md"
      variant="secondary"
      {...props}
    >
      {tGlobals("cancel")}
    </Button>
  );
};
