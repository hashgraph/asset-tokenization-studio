import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { IssueRequest } from "@iob/securitytoken-sdk";
import { useToast } from "@iob/io-bricks-ui/Overlay/Toast";
import { useTranslation } from "react-i18next";
import { checkError, KnownErrors } from "../../utils/helpers";

export const useMintSecurity = () => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "mint" });
  const { t: tErrors } = useTranslation("security", {
    keyPrefix: "details.allowedList.messages.operationsError",
  });

  //@ts-ignore
  return useMutation(
    (mintRequest: IssueRequest) => SDKService.mint(mintRequest),
    {
      onSuccess: (data) => {
        if (data === true) {
          toast.show({
            duration: 3000,
            title: `${t("messages.success")}`,
            description: `${t("messages.descriptionSuccess")}`,
            variant: "subtle",
            status: "success",
          });
        } else {
          toast.show({
            duration: 3000,
            title: t("messages.error"),
            description: t("messages.descriptionFailed"),
            variant: "subtle",
            status: "error",
          });
        }
      },
      onError: (error: { message: string }) => {
        console.log("SDK message --> Security mint error: ", error);
        const knownError = checkError(error);

        const errorTranslations = {
          [KnownErrors.blocked]: {
            ...tErrors("block", { returnObjects: true }),
          },
          [KnownErrors.not_approved]: {
            ...tErrors("approval", { returnObjects: true }),
          },
          [KnownErrors.unknown]: {
            title: t("messages.error"),
            description: error?.message,
          },
        };

        toast.show({
          duration: 3000,
          variant: "subtle",
          status: "error",
          ...errorTranslations[knownError],
        });
      },
      showErrorToast: false,
    },
  );
};
