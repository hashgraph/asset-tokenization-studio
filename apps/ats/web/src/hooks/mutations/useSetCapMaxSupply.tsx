import { useMutation, useQueryClient } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { SetMaxSupplyRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import {
  GET_BOND_DETAILS,
  GET_EQUITY_DETAILS,
} from "../queries/useGetSecurityDetails";

export const useSetCapMaxSupply = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.cap.messages",
  });

  return useMutation(
    (req: SetMaxSupplyRequest) => SDKService.setMaxSupply(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_BOND_DETAILS(variables.securityId)],
        });
        queryClient.invalidateQueries({
          queryKey: [GET_EQUITY_DETAILS(variables.securityId)],
        });

        console.log(
          "SDK message --> Cap set max supply operation success: ",
          data,
        );

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
        console.log(
          "SDK message --> Cap set max supply operation error: ",
          error,
        );

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("descriptionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};
