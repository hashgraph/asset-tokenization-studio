import { useMutation } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { UpdateConfigVersionRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";

export const useUpdateSecurityConfigVersion = () => {
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.management.messages",
  });

  return useMutation(
    (req: UpdateConfigVersionRequest) =>
      SDKService.updateSecurityConfigVersion(req),
    {
      onSuccess(data) {
        console.log(
          "SDK message --> Management update configuration version success: ",
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("updateConfigVersionSuccessful"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log("SDK message --> Grant role error: ", error);

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("updateConfigVersionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};
