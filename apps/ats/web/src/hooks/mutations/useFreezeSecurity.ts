// SPDX-License-Identifier: Apache-2.0

import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import { FreezePartialTokensRequest, UnfreezePartialTokensRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { checkError, KnownErrors } from "../../utils/helpers";

export const useFreezeSecurity = () => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "freeze" });
  const { t: tErrors } = useTranslation("security", {
    keyPrefix: "details.allowedList.messages.operationsError",
  });

  return useMutation((freezeRequest: FreezePartialTokensRequest) => SDKService.freezePartialTokens(freezeRequest), {
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
      console.log("SDK message --> Freeze Partial Tokens error: ", error);
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
  });
};

export const useUnfreezeSecurity = () => {
  const toast = useToast();
  const { t } = useTranslation("security", { keyPrefix: "freeze" });
  const { t: tErrors } = useTranslation("security", {
    keyPrefix: "details.allowedList.messages.operationsError",
  });

  return useMutation(
    (unfreezeRequest: UnfreezePartialTokensRequest) => SDKService.unfreezePartialTokens(unfreezeRequest),
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
        console.log("SDK message --> Unfreeze Partial Tokens: ", error);
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
    },
  );
};
