// SPDX-License-Identifier: Apache-2.0

import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { GetSecurityDetailsRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { AccountData, useAccountStore } from "../../store/accountStore";
import { useWalletStore } from "../../store/walletStore";
import { SecurityStore, useSecurityStore } from "../../store/securityStore";

export const useAddDigitalSecurity = () => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "add" });
  const { address: walletAddress } = useWalletStore();
  const { addSecurity, securities } = useSecurityStore();
  const { addSecurityToHolder, holderSecurities } = useAccountStore();

  return useMutation(
    (getEquityDetailsRequest: GetSecurityDetailsRequest) => SDKService.getSecurityDetails(getEquityDetailsRequest),
    {
      onSuccess: (data) => {
        if (
          holderSecurities[walletAddress]?.some((security: AccountData) => security.address === data.diamondAddress)
        ) {
          console.log("SDK message --> Security is already added");
          toast.show({
            duration: 3000,
            title: `${t("messages.alredyAdded")}`,
            variant: "subtle",
            status: "info",
          });
        } else {
          console.log("SDK message --> Security addition success: ", data);
          toast.show({
            duration: 3000,
            title: `${t("messages.succes")}`,
            description: `${t("messages.additionSucces")} ${data.diamondAddress}`,
            variant: "subtle",
            status: "success",
          });

          // add security to security store
          const security = {
            name: data.name ?? "",
            symbol: data.symbol ?? "",
            isin: data.isin ?? "",
            type: data.type,
            address: data.diamondAddress?.toString() ?? "",
            evmAddress: data.evmDiamondAddress?.toString() ?? "",
          };

          if (!securities.some((securityStore: SecurityStore) => securityStore.address === security.address)) {
            addSecurity(security);
          }

          // add security to account holder store
          addSecurityToHolder(walletAddress, {
            address: security.address,
            isFavorite: false,
          });
        }
      },
      onError: (error) => {
        console.log("SDK message --> Security addition error: ", error);
        toast.show({
          duration: 3000,
          title: t("messages.error"),
          description: t("messages.additionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};
