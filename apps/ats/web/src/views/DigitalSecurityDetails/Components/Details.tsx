// SPDX-License-Identifier: Apache-2.0

import { HStack, VStack } from "@chakra-ui/react";
import { BondDetailsViewModel, EquityDetailsViewModel, SecurityViewModel } from "@hashgraph/asset-tokenization-sdk";
import { useUserStore } from "../../../store/userStore";
import { User } from "../../../utils/constants";
import { SecurityDetailsExtended } from "./SecurityDetailsExtended";
import { HolderActionsButtons } from "./HolderActionsButtons";
import { DetailsRegulations } from "./Details/components/DetailsRegulations";
import { DetailsPermissions } from "./Details/components/DetailsPermissions";
import { DetailsTotalSupply } from "./Details/components/DetailsTotalSupply";
import { DetailsCurrentAvailableSupply } from "./Details/components/DetailsCurrentAvailableSupply";
import { DetailsBalanceAdjustment } from "./Details/components/DetailsBalanceAdjustment";

interface DetailsProps {
  id?: string;
  detailsResponse: SecurityViewModel;
  isLoadingSecurityDetails: boolean;
  isFetchingSecurityDetails: boolean;
  equityDetailsResponse?: EquityDetailsViewModel;
  bondDetailsResponse?: BondDetailsViewModel;
}

export const Details = ({
  id = "",
  equityDetailsResponse,
  bondDetailsResponse,
  detailsResponse,
  isLoadingSecurityDetails,
  isFetchingSecurityDetails,
}: DetailsProps) => {
  const { type: userType } = useUserStore();

  return (
    <VStack gap={6} pt={2} pb={8} w="full">
      {userType === User.holder && <HolderActionsButtons />}

      <HStack w="full" gap={8} alignItems="flex-start">
        <VStack w="full" gap={8}>
          <SecurityDetailsExtended
            layerStyle="container"
            bondDetailsResponse={bondDetailsResponse}
            equityDetailsResponse={equityDetailsResponse}
            isLoadingSecurityDetails={isLoadingSecurityDetails}
            isFetchingSecurityDetails={isFetchingSecurityDetails}
          />
        </VStack>
        <VStack w="full" gap={8}>
          <DetailsCurrentAvailableSupply
            id={id}
            detailsResponse={detailsResponse}
            equityDetailsResponse={equityDetailsResponse}
            bondDetailsResponse={bondDetailsResponse}
          />

          <DetailsTotalSupply
            detailsResponse={detailsResponse}
            equityDetailsResponse={equityDetailsResponse}
            bondDetailsResponse={bondDetailsResponse}
          />

          <DetailsPermissions
            isLoadingSecurityDetails={isLoadingSecurityDetails}
            isFetchingSecurityDetails={isFetchingSecurityDetails}
            securityDetails={detailsResponse}
            equityDetailsResponse={equityDetailsResponse}
          />

          <DetailsRegulations
            isLoadingSecurityDetails={isLoadingSecurityDetails}
            isFetchingSecurityDetails={isFetchingSecurityDetails}
            securityDetails={detailsResponse}
          />

          <DetailsBalanceAdjustment id={id} details={detailsResponse} />
        </VStack>
      </HStack>
    </VStack>
  );
};
