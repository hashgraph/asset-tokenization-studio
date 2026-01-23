// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQueryClient } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { SetIdentityRegistryRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { GET_IDENTITY_REGISTRY } from "../queries/useIdentityRegistry";

export const useUpdateIdentityRegistry = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.bond.updateIdentityRegistry.messages",
  });

  return useMutation((req: SetIdentityRegistryRequest) => SDKService.updateIdentityRegistry(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_IDENTITY_REGISTRY(variables.securityId)],
      });

      console.log("SDK message --> Update identity registry success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("success"),
        description: t("updateIdentityRegistrySuccessful"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Update identity registry error: ", error);

      toast.show({
        duration: 3000,
        title: t("error"),
        description: t("updateIdentityRegistryFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};
