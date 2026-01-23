// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQueryClient } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { SetComplianceRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { GET_COMPLIANCE } from "../queries/useCompliance";

export const useUpdateCompliance = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.bond.updateCompliance.messages",
  });

  return useMutation((req: SetComplianceRequest) => SDKService.updateCompliance(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_COMPLIANCE(variables.securityId)],
      });

      console.log("SDK message --> Update compliance success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("success"),
        description: t("updateComplianceSuccessful"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Update compliance error: ", error);

      toast.show({
        duration: 3000,
        title: t("error"),
        description: t("updateComplianceFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};
