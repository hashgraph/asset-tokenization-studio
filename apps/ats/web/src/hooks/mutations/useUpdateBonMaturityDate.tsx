import { useMutation, useQueryClient } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { UpdateMaturityDateRequest } from "@hashgraph/asset-tokenization-sdk";
import { useToast } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { GET_BOND_DETAILS } from "../queries/useGetSecurityDetails";

export const useUpdateBondMaturityDate = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.bond.updateMaturityDate.messages",
  });

  return useMutation(
    (req: UpdateMaturityDateRequest) => SDKService.updateBondMaturityDate(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_BOND_DETAILS(variables.securityId)],
        });

        console.log("SDK message --> Update maturity date success: ", data);

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("updateMaturityDateSuccessful"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log("SDK message --> Update maturity date error: ", error);

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("updateMaturityDateFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};
