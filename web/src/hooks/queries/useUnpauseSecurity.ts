import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { PauseRequest } from "@hashgraph/securitytoken-sdk";
import { useToast } from "@hashgraph/securitytoken-uicomponents/Overlay/Toast";
import { useTranslation } from "react-i18next";

export const useUnpauseSecurity = (
  options: UseMutationOptions<boolean, unknown, PauseRequest, unknown> = {},
) => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "unpause" });

  return useMutation(
    (pauseRequest: PauseRequest) => SDKService.unpause(pauseRequest),
    {
      onSuccess: (data) => {
        if (data === true) {
          toast.show({
            duration: 3000,
            title: `${t("messages.success")}`,
            description: `${t("messages.descriptionSuccess")}`,
            variant: "subtle",
            status: "success",
          });
        } else {
          toast.show({
            duration: 3000,
            title: t("messages.error"),
            description: t("messages.descriptionFailed"),
            variant: "subtle",
            status: "error",
          });
        }
      },
      onError: (error) => {
        console.log("SDK message --> Security pause error: ", error);
      },
      ...options,
    },
  );
};
