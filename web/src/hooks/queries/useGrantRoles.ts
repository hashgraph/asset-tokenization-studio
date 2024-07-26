import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { useToast } from "@hashgraph/assettokenization-uicomponents/Overlay/Toast";
import { useTranslation } from "react-i18next";
import { RoleRequest } from "@hashgraph/assettokenization-sdk";

export const useGrantRoles = () => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.roleManagement.messages",
  });

  return useMutation(
    (roleRequest: RoleRequest) => SDKService.grantRole(roleRequest),
    {
      onSuccess: (data) => {
        console.log("SDK message --> Grant role success: ", data);

        if (!data) return;

        toast.show({
          duration: 3000,
          title: t("succes"),
          description: t("grantRoleSuccessful"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log("SDK message --> Grant role error: ", error);
        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("grantRoleFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};
