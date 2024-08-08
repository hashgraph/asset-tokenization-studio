import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { ForceTransferRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "@hashgraph/asset-tokenization-uicomponents/Overlay/Toast";
import { useTranslation } from "react-i18next";

export const useForceTransferSecurity = (
  options: UseMutationOptions<
    boolean,
    unknown,
    ForceTransferRequest,
    unknown
  > = {},
) => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "transfer" });

  return useMutation(
    (forceTransferRequest: ForceTransferRequest) =>
      SDKService.controllerTransfer(forceTransferRequest),
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
        console.log("SDK message --> Security force transfer error: ", error);
      },
      ...options,
    },
  );
};
