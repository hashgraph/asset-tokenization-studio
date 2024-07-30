import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { type CreateBondRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "@hashgraph/asset-tokenization-uicomponents/Overlay/Toast";
import { useTranslation } from "react-i18next";
import { useSecurityStore } from "../../store/securityStore";
import { RouteName } from "../../router/RouteName";
import { RouterManager } from "../../router/RouterManager";
import { useAccountStore } from "../../store/accountStore";
import { useWalletStore } from "../../store/walletStore";

export const useCreateBond = () => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "createBond" });
  const { address } = useWalletStore();
  const { addSecurity } = useSecurityStore();
  const { addSecurityToAdmin, addSecurityToHolder } = useAccountStore();

  return useMutation(
    (createRequest: CreateBondRequest) => SDKService.createBond(createRequest),
    {
      onSuccess: (data) => {
        console.log("SDK message --> Security creation success: ", data);

        if (!data) return;

        const security = {
          name: data.security.name ?? "",
          symbol: data.security.symbol ?? "",
          isin: data.security.isin ?? "",
          type: data.security.type,
          address: data.security.diamondAddress?.toString() ?? "",
        };
        toast.show({
          duration: 3000,
          title: `${t("messages.succes")} ${security.name} - ${
            security.symbol
          }`,
          description: t("messages.creationSuccessful") + `${security.address}`,
          variant: "subtle",
          status: "success",
        });
        addSecurity(security);

        addSecurityToAdmin(address, {
          address: security.address,
          isFavorite: false,
        });

        addSecurityToHolder(address, {
          address: security.address,
          isFavorite: false,
        });

        RouterManager.to(RouteName.DigitalSecurityDetails, {
          params: { id: security.address },
        });
      },
      onError: (error) => {
        console.log("SDK message --> Security creation error: ", error);
        toast.show({
          duration: 3000,
          title: t("messages.error"),
          description: t("messages.creationFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};
