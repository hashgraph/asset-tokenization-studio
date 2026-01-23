import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import SDKService from "../../services/SDKService";
import {
  AddExternalControlListRequest,
  AddToBlackListMockRequest,
  AddToWhiteListMockRequest,
  IsAuthorizedBlackListMockRequest,
  IsAuthorizedWhiteListMockRequest,
  RemoveExternalControlListRequest,
  RemoveFromBlackListMockRequest,
  RemoveFromWhiteListMockRequest,
  UpdateExternalControlListsRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { GET_EXTERNAL_CONTROL_LIST_COUNT } from "../queries/useExternalControl";

export const useUpdateExternalControlLists = () => {
  const queryClient = useQueryClient();

  return useMutation((req: UpdateExternalControlListsRequest) => SDKService.updateExternalControlLists(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_EXTERNAL_CONTROL_LIST_COUNT(variables.securityId)],
      });

      console.log("SDK message --> Update external control operation success: ", data);
    },
    onError: (error) => {
      console.log("SDK message --> Update external control operation error: ", error);
    },
  });
};

export const useAddExternalControlList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalControl", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: AddExternalControlListRequest) => SDKService.addExternalControlList(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_EXTERNAL_CONTROL_LIST_COUNT(variables.securityId)],
      });

      console.log("SDK message --> Add external control operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("addExternalControl.success"),
        description: tAdd("addExternalControl.descriptionSuccess"),
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

export const useRemoveExternalControlList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("externalControl", {
    keyPrefix: "list.messages",
  });

  return useMutation((req: RemoveExternalControlListRequest) => SDKService.removeExternalControlList(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_EXTERNAL_CONTROL_LIST_COUNT(variables.securityId)],
      });

      console.log("SDK message --> Remove external control operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("removeExternalControl.success"),
        description: t("removeExternalControl.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Remove external control operation error: ", error);

      toast.show({
        duration: 3000,
        title: t("removeExternalControl.error"),
        description: t("removeExternalControl.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useCreateExternalBlackListMock = () => {
  const toast = useToast();
  const { t } = useTranslation("externalControl", {
    keyPrefix: "create.messages",
  });

  return useMutation(() => SDKService.createExternalBlackListMock(), {
    onSuccess(data) {
      console.log("SDK message --> Control mock created success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("createExternalControl.success"),
        description: t("createExternalControl.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Pause mock created error: ", error);

      toast.show({
        duration: 3000,
        title: t("createExternalControl.error"),
        description: t("createExternalControl.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useCreateExternalWhiteListMock = () => {
  const toast = useToast();
  const { t } = useTranslation("externalControl", {
    keyPrefix: "create.messages",
  });

  return useMutation(() => SDKService.createExternalWhiteListMock(), {
    onSuccess(data) {
      console.log("SDK message --> Control mock created success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("createExternalControl.success"),
        description: t("createExternalControl.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Pause mock created error: ", error);

      toast.show({
        duration: 3000,
        title: t("createExternalControl.error"),
        description: t("createExternalControl.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useAddToWhiteListMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalControl", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: AddToWhiteListMockRequest) => SDKService.addToWhiteListMock(req), {
    onSuccess(data) {
      console.log("SDK message --> Add address operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("addAddressControl.success"),
        description: tAdd("addAddressControl.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Add address operation error: ", error);

      toast.show({
        duration: 3000,
        title: tAdd("addAddressControl.error"),
        description: tAdd("addAddressControl.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useAddToBlackListMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalControl", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: AddToBlackListMockRequest) => SDKService.addToBlackListMock(req), {
    onSuccess(data) {
      console.log("SDK message --> Add address operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("addAddressControl.success"),
        description: tAdd("addAddressControl.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Add external control operation error: ", error);

      toast.show({
        duration: 3000,
        title: tAdd("addAddressControl.error"),
        description: tAdd("addAddressControl.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useRemoveFromBlackListMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalControl", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: RemoveFromBlackListMockRequest) => SDKService.removeFromBlackListMock(req), {
    onSuccess(data) {
      console.log("SDK message --> Remove address operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("removeAddressControl.success"),
        description: tAdd("removeAddressControl.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Add external control operation error: ", error);

      toast.show({
        duration: 3000,
        title: tAdd("removeAddressControl.error"),
        description: tAdd("removeAddressControl.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useRemoveFromWhiteListMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalControl", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: RemoveFromWhiteListMockRequest) => SDKService.removeFromWhiteListMock(req), {
    onSuccess(data) {
      console.log("SDK message --> Remove address operation success: ", data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: tAdd("removeAddressControl.success"),
        description: tAdd("removeAddressControl.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Add external control operation error: ", error);

      toast.show({
        duration: 3000,
        title: tAdd("removeAddressControl.error"),
        description: tAdd("removeAddressControl.descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};

export const useIsAuthorizedBlackListMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalControl", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: IsAuthorizedBlackListMockRequest) => SDKService.isAuthorizedBlackListMock(req), {
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

export const useIsAuthorizedWhiteListMock = () => {
  const toast = useToast();
  const { t: tAdd } = useTranslation("externalControl", {
    keyPrefix: "add.messages",
  });

  return useMutation((req: IsAuthorizedWhiteListMockRequest) => SDKService.isAuthorizedWhiteListMock(req), {
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
