import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { useTranslation } from "react-i18next";
import {
  ControlListRequest,
  GetControlListCountRequest,
  GetControlListMembersRequest,
} from "@hashgraph/securitytoken-sdk";
import { useToast } from "@hashgraph/uiComponents/Overlay/Toast";

export const GET_CONTROL_LIST_COUNT = (securityId: string) =>
  `GET_CONTROL_LIST_COUNT${securityId}`;

export const GET_CONTROL_LIST_MEMBERS = (
  securityId: string,
  start: number,
  end: number,
) => `GET_CONTROL_LIST_COUNT${securityId}_${start}_${end}`;

export const useGetControlListCount = <TError, TData = number>(
  request: GetControlListCountRequest,
  options?: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_CONTROL_LIST_COUNT(request.securityId)],
    () => SDKService.getControlListCount(request),
    options,
  );
};

export const useGetControlListMembers = <TError, TData = string[]>(
  params: GetControlListMembersRequest,
  options?: UseQueryOptions<string[], TError, TData, [string]>,
) => {
  return useQuery(
    [GET_CONTROL_LIST_MEMBERS(params.securityId, params.start, params.end)],
    () => SDKService.getControlListMembers(params),
    options,
  );
};

export const useAddToControlList = (
  options: UseMutationOptions<
    boolean,
    unknown,
    ControlListRequest,
    unknown
  > = {},
) => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.allowedList",
  });

  return useMutation(
    (controlListRequest: ControlListRequest) =>
      SDKService.addToControlList(controlListRequest),
    {
      onSuccess: (data) => {
        console.log("SDK message --> Add to control list success: ", data);

        if (!data) return;

        toast.show({
          duration: 3000,
          title: t("messages.succes"),
          description: t("messages.addToControlListSuccessful"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log("SDK message --> Add to control list error: ", error);
        toast.show({
          duration: 3000,
          title: t("messages.error"),
          description: t("messages.addFailed"),
          variant: "subtle",
          status: "error",
        });
      },
      ...options,
    },
  );
};

export const useRemoveFromControlList = (
  options: UseMutationOptions<
    boolean,
    unknown,
    ControlListRequest,
    unknown
  > = {},
) => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.allowedList",
  });

  return useMutation(
    (controlListRequest: ControlListRequest) =>
      SDKService.removeFromControlList(controlListRequest),
    {
      onSuccess: (data) => {
        console.log("SDK message --> Remove from control list success: ", data);

        if (!data) return;

        toast.show({
          duration: 3000,
          title: t("messages.succes"),
          description: t("messages.removeFromControlListSuccessful"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log("SDK message --> Remove from control list error: ", error);
        toast.show({
          duration: 3000,
          title: t("messages.error"),
          description: t("messages.removeFailed"),
          variant: "subtle",
          status: "error",
        });
      },
      ...options,
    },
  );
};
