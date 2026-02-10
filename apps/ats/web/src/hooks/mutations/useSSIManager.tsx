// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQueryClient } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  AddIssuerRequest,
  RemoveIssuerRequest,
  SetRevocationRegistryAddressRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { GET_ISSUERS_LIST, GET_REVOCATION_REGISTRY_ADDRESS } from "../queries/useSSIManager";

export const useAddIssuer = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.ssiManager.messages",
  });

  return useMutation((req: AddIssuerRequest) => SDKService.addIssuer(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_ISSUERS_LIST(variables.securityId)],
      });

      console.log("SDK message --> Add Issuer operation success: ", data);

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
      console.log("SDK message --> SSI Manager operation error: ", error);

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

export const useRemoveIssuer = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.ssiManager.messages",
  });

  return useMutation((req: RemoveIssuerRequest) => SDKService.removeIssuer(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_ISSUERS_LIST(variables.securityId)],
      });

      console.log("SDK message --> Add Issuer operation success: ", data);

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
      console.log("SDK message --> SSI Manager operation error: ", error);

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

export const useSetRevocationRegistryAddress = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.ssiManager.messages",
  });

  return useMutation((req: SetRevocationRegistryAddressRequest) => SDKService.setRevocationRegistryAddress(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_REVOCATION_REGISTRY_ADDRESS(variables.securityId)],
      });

      console.log("SDK message --> Add Issuer operation success: ", data);

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
      console.log("SDK message --> SSI Manager operation error: ", error);

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
