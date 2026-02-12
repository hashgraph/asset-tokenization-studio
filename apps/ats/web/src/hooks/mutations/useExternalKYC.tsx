// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import SDKService from "../../services/SDKService";
import {
  AddExternalKycListRequest,
  GetKycStatusMockRequest,
  GrantKycMockRequest,
  RemoveExternalKycListRequest,
  RevokeKycMockRequest,
  UpdateExternalKycListsRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { GET_EXTERNAL_KYC_COUNT } from "../queries/useExternalKYC";

export const useUpdateExternalKYCLists = () => {
  const queryClient = useQueryClient();

  return useMutation((req: UpdateExternalKycListsRequest) => SDKService.updateExternalKycLists(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_EXTERNAL_KYC_COUNT(variables.securityId)],
      });

      console.log("SDK message --> Update external KYC operation success: ", data);
    },
    onError: (error) => {
      console.log("SDK message --> Update external KYC operation error: ", error);
    },
  });
};

export const useAddExternalKYCList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalKYC", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: AddExternalKycListRequest) => SDKService.addExternalKycList(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_EXTERNAL_KYC_COUNT(variables.securityId)],
      });

      console.log("SDK message --> Add external KYC operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("addExternalKYC.success"),
        description: tAdd("addExternalKYC.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Add external control operation error: ", error);

      toast.show({
        duration: 3000,
        title: tAdd("addExternalControl.error"),
        description: tAdd("addExternalControl.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useRemoveExternalKYCList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("externalKYC", {
    keyPrefix: "list.messages",
  });

  return useMutation((req: RemoveExternalKycListRequest) => SDKService.removeExternalKycList(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_EXTERNAL_KYC_COUNT(variables.securityId)],
      });

      console.log("SDK message --> Remove external KYC operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("removeExternalKYC.success"),
        description: t("removeExternalKYC.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Remove external KYC operation error: ", error);

      toast.show({
        duration: 3000,
        title: t("removeExternalKYC.error"),
        description: t("removeExternalKYC.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useCreateExternalKYCMock = () => {
  const toast = useToast();
  const { t } = useTranslation("externalKYC", {
    keyPrefix: "create.messages",
  });

  return useMutation(() => SDKService.createExternalKycMock(), {
    onSuccess(data) {
      console.log("SDK message --> KYC mock created success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("createExternalKYC.success"),
        description: t("createExternalKYC.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> KYC mock created error: ", error);

      toast.show({
        duration: 3000,
        title: t("createExternalKYC.error"),
        description: t("createExternalKYC.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useGrantKycMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalKYC", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: GrantKycMockRequest) => SDKService.grantKycMock(req), {
    onSuccess(data) {
      console.log("SDK message --> Add address operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("addAddressKYC.success"),
        description: tAdd("addAddressKYC.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Add address operation error: ", error);

      toast.show({
        duration: 3000,
        title: tAdd("addAddressKYC.error"),
        description: tAdd("addAddressKYC.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useRevokeKycMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalKYC", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: RevokeKycMockRequest) => SDKService.revokeKycMock(req), {
    onSuccess(data) {
      console.log("SDK message --> Remove address operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("removeAddressKYC.success"),
        description: tAdd("removeAddressKYC.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Remove external KYC operation error: ", error);

      toast.show({
        duration: 3000,
        title: tAdd("removeAddressKYC.error"),
        description: tAdd("removeAddressKYC.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useIsAuthorizedKYCListMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalKYC", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: GetKycStatusMockRequest) => SDKService.getKycStatusMock(req), {
    onSuccess(data) {
      console.log("SDK message --> Is authorized address operation success: ", data);

      if (data) {
        toast.show({
          duration: 3000,
          title: tAdd("isAddressAuthorized.success"),
          description: tAdd("isAddressAuthorized.descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("isAddressNotAuthorized.success"),
        description: tAdd("isAddressNotAuthorized.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Add external control operation error: ", error);

      toast.show({
        duration: 3000,
        title: tAdd("isAddressAuthorized.error"),
        description: tAdd("isAddressAuthorized.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};
