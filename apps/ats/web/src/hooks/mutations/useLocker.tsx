// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQueryClient } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { LockRequest, ReleaseRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { GET_BOND_DETAILS } from "../queries/useGetSecurityDetails";
import { GET_LOCKERS } from "../queries/useGetLockers";

export const useLocker = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.locker.messages",
  });

  return useMutation((req: LockRequest) => SDKService.lock(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_BOND_DETAILS(variables.securityId)],
      });

      console.log("SDK message --> Locker operation success: ", data);

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
      console.log("SDK message --> Locker operation error: ", error);

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

export const useRelease = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.locker.release.messages",
  });

  return useMutation((req: ReleaseRequest) => SDKService.release(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [GET_LOCKERS(variables.securityId, variables.targetId)],
      });

      console.log("SDK message --> Unlock operation success: ", data);

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
      console.log("SDK message --> Unlock operation error: ", error);

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
