import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "@iob/io-bricks-ui/Overlay/Toast";
import { useTranslation } from "react-i18next";
import { ApplyRolesRequest } from "@iob/securitytoken-sdk";

export const useApplyRoles = () => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.roleManagement.messages",
  });

  return useMutation(
    (applyRolesRequest: ApplyRolesRequest) =>
      SDKService.applyRoles(applyRolesRequest),
    {
      onSuccess: (data) => {
        console.log("SDK message --> Apply roles success: ", data);

        if (!data) return;

        toast.show({
          duration: 3000,
          title: t("succes"),
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
    },
  );
};
