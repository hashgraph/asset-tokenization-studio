import { useMutation, useQueryClient } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { UpdateConfigRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { GET_CONFIG_INFO } from "../queries/useGetConfigDetails";

export const useUpdateSecurityConfigId = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.management.messages",
  });

  return useMutation(
    (req: UpdateConfigRequest) => SDKService.updateSecurityConfig(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_CONFIG_INFO(variables.securityId)],
        });

        console.log(
          "SDK message --> Management update configuration id success: ",
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("updateConfigSuccessful"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log("SDK message --> Grant role error: ", error);

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("updateConfigFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};
