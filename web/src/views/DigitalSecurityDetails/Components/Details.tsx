import { Box, Center, HStack, VStack } from "@chakra-ui/react";
import { Text } from "@iob/io-bricks-ui/Foundations";
import { DefinitionList } from "@iob/io-bricks-ui/DataDisplay";
import { Panel } from "../../../components/Panel";
import { useTranslation } from "react-i18next";
import { ActionsButtons } from "./ActionsButtons";
import {
  BondDetailsViewModel,
  EquityDetailsViewModel,
  GetAccountBalanceRequest,
  GetAllCouponsRequest,
  GetAllDividendsRequest,
  SecurityViewModel,
} from "@iob/securitytoken-sdk";
import { formatNumberLocale, toNumber } from "../../../utils/format";
import { useUserStore } from "../../../store/userStore";
import { COUPONS_FACTOR, User } from "../../../utils/constants";
import { useSecurityStore } from "../../../store/securityStore";
import { SkeletonText } from "@chakra-ui/react";
import {
  useGetAllDividends,
  useGetBalanceOf,
} from "../../../hooks/queries/useGetSecurityDetails";
import { useWalletStore } from "../../../store/walletStore";
import { SecurityDetailsExtended } from "./SecurityDetailsExtended";
import { useGetAllCoupons } from "../../../hooks/queries/useCoupons";
import { CountriesList } from "../../CreateSecurityCommons/CountriesList";
import _capitalize from "lodash/capitalize";

interface DetailsProps {
  id?: string;
  detailsResponse: SecurityViewModel;
  equityDetailsResponse: EquityDetailsViewModel;
  bondDetailsResponse: BondDetailsViewModel;
}

export const Details = ({
  id = "",
  equityDetailsResponse,
  bondDetailsResponse,
}: DetailsProps) => {
  const { t: tProperties } = useTranslation("properties");
  const { t: tPermissions } = useTranslation("properties", {
    keyPrefix: "permissions",
  });
  const { t: tRights } = useTranslation("security", {
    keyPrefix: "createEquity",
  });
  const { t: tBenefits } = useTranslation("security", {
    keyPrefix: "details.benefits",
  });
  const { t: tRegulations } = useTranslation("properties", {
    keyPrefix: "regulations",
  });
  const { t: tRegulation } = useTranslation("security", {
    keyPrefix: "regulation",
  });

  const { type: userType } = useUserStore();
  const { details = {} } = useSecurityStore();
  const { address: walletAddress } = useWalletStore();

  // DIVIDENDS
  const dividendsRequest = new GetAllDividendsRequest({
    securityId: id,
  });
  const { data: dividends } = useGetAllDividends(dividendsRequest);

  // COUPONS
  const couponsRequest = new GetAllCouponsRequest({
    securityId: id,
  });
  const { data: coupons } = useGetAllCoupons(couponsRequest);

  const rightsAndPrivileges = {
    votingRights: equityDetailsResponse.votingRight,
    informationRights: equityDetailsResponse.informationRight,
    liquidationRights: equityDetailsResponse.liquidationRight,
    subscriptionRights: equityDetailsResponse.subscriptionRight,
    conversionRights: equityDetailsResponse.convertionRight,
    redemptionRights: equityDetailsResponse.redemptionRight,
    putRights: equityDetailsResponse.putRight,
  };

  const rightsAndPrivilegesFiltered = Object.entries(rightsAndPrivileges)
    .filter(([_key, value]) => value)
    .map(([key]) => tRights(`stepNewSerie.${key}`));

  const balanceOfRequest = new GetAccountBalanceRequest({
    securityId: id,
    targetId: walletAddress,
  });

  const { data: availableBalance, isLoading: isAvailableBalanceLoading } =
    useGetBalanceOf(balanceOfRequest);

  const permissionsItems = [
    {
      title: tPermissions("controllable"),
      description: details?.isControllable
        ? tPermissions("allowed")
        : tPermissions("notAllowed"),
    },
    {
      title: tPermissions("blocklist"),
      description: details?.isWhiteList
        ? tPermissions("notAllowed")
        : tPermissions("allowed"),
    },
    {
      title: tPermissions("approvalList"),
      description: details?.isWhiteList
        ? tPermissions("allowed")
        : tPermissions("notAllowed"),
    },
  ];

  const {
    type,
    subType = "",
    dealSize = "",
    accreditedInvestors = "",
    maxNonAccreditedInvestors = "",
    manualInvestorVerification = "",
    internationalInvestors = "",
    resaleHoldPeriod = "",
  } = details?.regulation || {};

  const regulationItems = [
    {
      title: tRegulations("regulationType"),
      description: tRegulation(`regulationType_${type}`),
    },
    {
      title: tRegulations("regulationSubType"),
      description: subType.replace("_", " "),
    },
    {
      title: details?.isCountryControlListWhiteList
        ? tRegulations("allowedCountries")
        : tRegulations("blockedCountries"),
      description:
        details?.countries
          ?.split(",")
          .map(
            (country) => CountriesList[country as keyof typeof CountriesList],
          )
          .join(" - ") ?? "",
    },
    {
      title: tRegulations("dealSize"),
      description:
        dealSize !== "0"
          ? `${dealSize} $`
          : tRegulations("dealSizePlaceHolder"),
    },
    {
      title: tRegulations("accreditedInvestors"),
      description: _capitalize(accreditedInvestors),
    },
    {
      title: tRegulations("maxNonAccreditedInvestors"),
      description:
        maxNonAccreditedInvestors !== 0
          ? `${maxNonAccreditedInvestors}`
          : tRegulations("maxNonAccreditedInvestorsPlaceHolder"),
    },
    {
      title: tRegulations("manualInvestorVerification"),
      description: _capitalize(manualInvestorVerification),
    },
    {
      title: tRegulations("internationalInvestors"),
      description: _capitalize(internationalInvestors),
    },
    {
      title: tRegulations("resaleHoldPeriod"),
      description: _capitalize(resaleHoldPeriod),
    },
  ];

  if (Object.keys(equityDetailsResponse).length > 0) {
    permissionsItems.push({
      title: tPermissions("rightsAndPrivileges"),
      description: rightsAndPrivilegesFiltered.join(", "),
    });
  }

  const currentAvailableBalance = toNumber(availableBalance?.value);

  const nominalValue = toNumber(
    equityDetailsResponse?.nominalValue || bondDetailsResponse?.nominalValue,
    2,
  );

  const totalAvailableBalanceValue = nominalValue * currentAvailableBalance;

  const nominalTotalValue = formatNumberLocale(
    nominalValue * ((details?.totalSupply ?? 0) as number),
    2,
  );

  return (
    <VStack gap={6} pt={2} pb={8} w="full">
      <ActionsButtons />
      <HStack w="full" gap={8} alignItems="flex-start">
        <VStack w="full" gap={8}>
          <SecurityDetailsExtended
            layerStyle="container"
            nominalValue={nominalValue}
          />
          {dividends?.map((dividend) => (
            <DefinitionList
              key={dividend.dividendId}
              items={[
                {
                  title: tBenefits("id"),
                  description: dividend.dividendId ?? "",
                },
                {
                  title: tBenefits("recordDate"),
                  description:
                    new Date(
                      dividend.recordDate.getTime(),
                    ).toLocaleDateString() ?? "",
                },
                {
                  title: tBenefits("executionDate"),
                  description:
                    new Date(
                      dividend.executionDate.getTime(),
                    ).toLocaleDateString() ?? "",
                },
                {
                  title: tBenefits("dividendAmount"),
                  description: dividend.amountPerUnitOfSecurity ?? "",
                },
                ...(dividend.snapshotId
                  ? [
                      {
                        title: "Snapshot Id",
                        description: dividend.snapshotId,
                      },
                    ]
                  : []),
              ]}
              title={tBenefits("dividends")}
              layerStyle="container"
            />
          ))}
          {coupons?.map((coupon) => (
            <DefinitionList
              key={coupon.couponId}
              items={[
                {
                  title: tBenefits("id"),
                  description: coupon.couponId ?? "",
                },
                {
                  title: tBenefits("recordDate"),
                  description:
                    new Date(
                      coupon.recordDate.getTime(),
                    ).toLocaleDateString() ?? "",
                },
                {
                  title: tBenefits("executionDate"),
                  description:
                    new Date(
                      coupon.executionDate.getTime(),
                    ).toLocaleDateString() ?? "",
                },
                {
                  title: tBenefits("couponRate"),
                  description:
                    `${parseInt(coupon.rate) / COUPONS_FACTOR}%` ?? "",
                },
                ...(coupon.snapshotId
                  ? [
                      {
                        title: tBenefits("snapshot"),
                        description: coupon.snapshotId,
                      },
                    ]
                  : []),
              ]}
              title={tBenefits("coupons")}
              layerStyle="container"
            />
          ))}
        </VStack>
        <VStack w="full" gap={8}>
          {userType === User.holder && (
            <Panel title={tProperties("currentAvailableBalance")}>
              <Center w="full">
                {isAvailableBalanceLoading ? (
                  <SkeletonText skeletonHeight={2} flex={1} noOfLines={1} />
                ) : (
                  <Box>
                    <Text textStyle="ElementsSemibold2XL">
                      {currentAvailableBalance}
                      <Text ml={1} as="span" textStyle="ElementsRegularMD">
                        {details?.symbol ?? ""}
                      </Text>
                    </Text>
                    <Text ml={1} as="span" textStyle="ElementsRegularMD">
                      {tProperties("nominalTotalValue")}
                      {formatNumberLocale(totalAvailableBalanceValue, 2)}
                    </Text>
                  </Box>
                )}
              </Center>
            </Panel>
          )}
          <Panel title={tProperties("totalSupply")}>
            <Center w="full">
              {details ? (
                <Box>
                  <Text textStyle="ElementsSemibold2XL">
                    {details?.totalSupply ?? ""}
                    <Text ml={1} as="span" textStyle="ElementsRegularMD">
                      {details?.symbol ?? ""}
                    </Text>
                  </Text>
                  <Text ml={1} as="span" textStyle="ElementsRegularMD">
                    {tProperties("nominalTotalValue")}
                    {nominalTotalValue}
                  </Text>
                </Box>
              ) : (
                <SkeletonText skeletonHeight={2} flex={1} noOfLines={1} />
              )}
            </Center>
          </Panel>
          <DefinitionList
            isLoading={details === null}
            items={permissionsItems}
            title={tPermissions("label")}
            layerStyle="container"
          />

          <DefinitionList
            isLoading={details === null}
            items={regulationItems}
            title={tRegulations("label")}
            layerStyle="container"
          />
        </VStack>
      </HStack>
    </VStack>
  );
};
