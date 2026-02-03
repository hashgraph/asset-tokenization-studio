// SPDX-License-Identifier: Apache-2.0

import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { ApplyRolesRequest } from "@hashgraph/asset-tokenization-sdk";
import { useRolesStore } from "../../store/rolesStore";
import { useWalletStore } from "../../store/walletStore";

export const useApplyRoles = () => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.roleManagement.messages",
  });
  const { setRoles } = useRolesStore();
  const { address } = useWalletStore();

  return useMutation((applyRolesRequest: ApplyRolesRequest) => SDKService.applyRoles(applyRolesRequest), {
    onSuccess: (data, variables) => {
      console.log("SDK message --> Apply roles success: ", data);

      if (!data) return;

      // Update roles if the connected wallet matches the target ID
      if (address === variables.targetId) {
        setRoles(variables.roles.filter((_rol, index) => variables.actives[index]));
      }

      toast.show({
        duration: 3000,
        title: t("success"),
        description: t("applyRoleSuccessful"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log("SDK message --> Apply roles error: ", error);
      toast.show({
        duration: 3000,
        title: t("error"),
        description: t("applyRoleFailed"),
        variant: "subtle",
        status: "error",
      });
    },
  });
};
