import { DefinitionList } from "io-bricks-ui";
import { useGetAllBalanceAdjustments } from "../../../../../hooks/queries/useBalanceAdjustment";
import {
  GetAllScheduledBalanceAdjustmentsRequest,
  SecurityViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../../../../utils/format";
import { DATE_TIME_FORMAT } from "../../../../../utils/constants";
import { Stack } from "@chakra-ui/react";

interface DetailsBalanceAdjustmentProps {
  id: string;
  details: SecurityViewModel;
}

export const DetailsBalanceAdjustment = ({
  id,
  details,
}: DetailsBalanceAdjustmentProps) => {
  const { t: tBenefits } = useTranslation("security", {
    keyPrefix: "details.benefits",
  });

  const { data: balanceAdjustments } = useGetAllBalanceAdjustments(
    new GetAllScheduledBalanceAdjustmentsRequest({
      securityId: id,
    }),
    {
      enabled: details?.type === "EQUITY",
    },
  );

  return (
    <Stack>
      {balanceAdjustments?.map((balanceAdjustment) => (
        <DefinitionList
          key={balanceAdjustment.id}
          items={[
            {
              title: tBenefits("executionDate"),
              description:
                formatDate(balanceAdjustment.executionDate, DATE_TIME_FORMAT) ??
                "",
            },
            {
              title: tBenefits("factor"),
              description:
                (
                  Number(balanceAdjustment.factor) /
                  Math.pow(10, Number(balanceAdjustment.decimals))
                ).toString() ?? "",
            },
          ]}
          title={tBenefits("balanceAdjustments")}
          layerStyle="container"
        />
      ))}
    </Stack>
  );
};
