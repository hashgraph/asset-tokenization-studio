import { useMutation, useQueryClient } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  GrantKycRequest,
  RevokeKycRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { GET_KYC_LIST } from "../queries/useKYC";

export const useGrantKYC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.kyc.messages",
  });

  return useMutation((req: GrantKycRequest) => SDKService.grantKYC(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_KYC_LIST(variables.securityId)],
      });

      console.log("SDK message --> Add KYC operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("success"),
        description: t("descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> KYC operation error: ", error);

      toast.show({
        duration: 3000,
        title: t("error"),
        description: t("descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useRevokeKYC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.kyc.messages",
  });

  return useMutation((req: RevokeKycRequest) => SDKService.revokeKYC(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_KYC_LIST(variables.securityId)],
      });

      console.log("SDK message --> Revoke KYC operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("success"),
        description: t("descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> KYC operation error: ", error);

      toast.show({
        duration: 3000,
        title: t("error"),
        description: t("descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};
