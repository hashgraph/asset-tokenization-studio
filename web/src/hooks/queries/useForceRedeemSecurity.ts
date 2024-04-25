import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { ForceRedeemRequest } from "@hashgraph/securitytoken-sdk";
import { useToast } from "@hashgraph/uiComponents/Overlay/Toast";
import { useTranslation } from "react-i18next";

export const useForceRedeemSecurity = (
  options: UseMutationOptions<
    boolean,
    unknown,
    ForceRedeemRequest,
    unknown
  > = {},
) => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "redeem" });

  return useMutation(
    (forceRedeemRequest: ForceRedeemRequest) =>
      SDKService.controllerRedeem(forceRedeemRequest),
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
        console.log("SDK message --> Security force redeem error: ", error);
      },
      ...options,
    },
  );
};
