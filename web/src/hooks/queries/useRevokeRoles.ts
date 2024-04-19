import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "@iob/io-bricks-ui/Overlay/Toast";
import { useTranslation } from "react-i18next";
import { RoleRequest } from "@iob/securitytoken-sdk";

export const useRevokeRoles = () => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.roleManagement.messages",
  });

  return useMutation(
    (roleRequest: RoleRequest) => SDKService.revokeRole(roleRequest),
    {
      onSuccess: (data) => {
        console.log("SDK message --> Revoke role success: ", data);

        if (!data) return;

        toast.show({
          duration: 3000,
          title: t("succes"),
          description: t("revokeRoleSuccessful"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log("SDK message --> Revoke role error: ", error);
        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("revokeRoleFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};
