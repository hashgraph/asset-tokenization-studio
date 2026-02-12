// SPDX-License-Identifier: Apache-2.0

import { HStack, Stack } from "@chakra-ui/react";
import { Tag, Tabs, Spinner, Text, TabProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { History } from "../../components/History";
import { Details } from "./Components/Details";
import { Balance } from "./Components/Balance";
import {
  GetSecurityDetailsRequest,
  PauseRequest,
  SecurityViewModel,
  GetEquityDetailsRequest,
  GetBondDetailsRequest,
  GetRoleCountForRequest,
  GetRolesForRequest,
} from "@hashgraph/asset-tokenization-sdk";
import {
  useGetBondDetails,
  useGetEquityDetails,
  useGetIsPaused,
  useGetSecurityDetails,
  useGetSecurityRoleCountFor,
  useGetSecurityRolesFor,
} from "../../hooks/queries/useGetSecurityDetails";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { User } from "../../utils/constants";
import { useUserStore } from "../../store/userStore";
import { SecurityRole } from "../../utils/SecurityRole";
import { useRolesStore } from "../../store/rolesStore";
import { ManagementTab } from "./Components/Tabs/Management";
import { OperationsTab } from "./Components/Tabs/Operations";
import { ControlTab } from "./Components/Tabs/Control";
import { CorporateActionsTab } from "./Components/Tabs/CorporateActions";
import { hasRole } from "../../utils/helpers";
import { useWalletStore } from "../../store/walletStore";

export const DigitalSecurityDetails = () => {
  const { id = "" } = useParams();

  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "details.header",
  });
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.tabs",
  });

  const { address: walletAddress } = useWalletStore();
  const { type: userType } = useUserStore();
  const { roles: rolesStored, setRoles } = useRolesStore();

  const {
    data: securityDetails,
    isLoading: isLoadingSecurityDetails,
    isFetching: isFetchingSecurityDetails,
  } = useGetSecurityDetails(
    new GetSecurityDetailsRequest({
      securityId: id,
    }),
    {
      enabled: !!id,
    },
  );

  // GET EQUITY DETAILS
  const { data: equityDetails } = useGetEquityDetails(
    new GetEquityDetailsRequest({
      equityId: id,
    }),
    {
      retry: false,
      enabled: securityDetails?.type === "EQUITY",
    },
  );

  // GET BOND DETAILS
  const { data: bondDetails } = useGetBondDetails(
    new GetBondDetailsRequest({
      bondId: id,
    }),
    {
      retry: false,
      enabled: securityDetails?.type === "BOND_VARIABLE_RATE",
    },
  );

  // ROLE COUNT FOR
  const { data: roleCountFor } = useGetSecurityRoleCountFor(
    new GetRoleCountForRequest({
      securityId: id,
      targetId: walletAddress,
    }),
    {
      staleTime: 0,
      cacheTime: 0,
    },
  );

  // ROLES FOR
  const { isLoading: isLoadingRoles } = useGetSecurityRolesFor(
    new GetRolesForRequest({
      securityId: id,
      targetId: walletAddress,
      start: 0,
      end: roleCountFor ?? 0,
    }),
    {
      enabled: !!roleCountFor,
      onSuccess: (roles) => setRoles(roles as SecurityRole[]),
      staleTime: 0,
      cacheTime: 0,
    },
  );

  // IS PAUSED
  const { data: isPaused, isLoading: isLoadingIsPaused } = useGetIsPaused(new PauseRequest({ securityId: id }));

  const tabs = useMemo(() => {
    const holderTabs = [
      {
        content: (
          <Details
            id={id}
            detailsResponse={securityDetails ?? ({} as SecurityViewModel)}
            isLoadingSecurityDetails={isLoadingSecurityDetails}
            isFetchingSecurityDetails={isFetchingSecurityDetails}
            equityDetailsResponse={equityDetails}
            bondDetailsResponse={bondDetails}
          />
        ),
        header: tTabs("details"),
      },
      {
        content: <Balance id={id} detailsResponse={securityDetails ?? {}} />,
        header: tTabs("balance"),
      },
    ];

    if (userType !== User.admin) return holderTabs;

    const adminTabs: TabProps[] = [
      {
        content: (
          <Details
            id={id}
            detailsResponse={securityDetails ?? ({} as SecurityViewModel)}
            isLoadingSecurityDetails={isLoadingSecurityDetails}
            isFetchingSecurityDetails={isFetchingSecurityDetails}
            equityDetailsResponse={equityDetails}
            bondDetailsResponse={bondDetails}
          />
        ),
        header: tTabs("details"),
      },
      {
        content: <Balance id={id} detailsResponse={securityDetails ?? {}} />,
        header: tTabs("balance"),
      },
    ];

    const isSecurityPaused = !isLoadingIsPaused && isPaused;

    const operationsConfig = {
      showLocker: !isSecurityPaused && hasRole(rolesStored, SecurityRole._LOCKER_ROLE),
      showHold: !isSecurityPaused,
      showCap: !isSecurityPaused && hasRole(rolesStored, SecurityRole._CAP_ROLE),
      showClearingOperations: !isSecurityPaused && hasRole(rolesStored, SecurityRole._CLEARING_VALIDATOR_ROLE),
      showFreeze: !isSecurityPaused && hasRole(rolesStored, SecurityRole._FREEZE_MANAGER_ROLE),
    };

    const corporateActionsConfig = {
      showBalanceAdjustment:
        !isSecurityPaused &&
        securityDetails?.type === "EQUITY" &&
        hasRole(rolesStored, SecurityRole._CORPORATEACTIONS_ROLE),
      showDividends:
        !isSecurityPaused &&
        securityDetails?.type === "EQUITY" &&
        hasRole(rolesStored, SecurityRole._CORPORATEACTIONS_ROLE),
      showVotingRights:
        !isSecurityPaused &&
        securityDetails?.type === "EQUITY" &&
        hasRole(rolesStored, SecurityRole._CORPORATEACTIONS_ROLE),
      showCoupons:
        !isSecurityPaused &&
        securityDetails?.type === "BOND_VARIABLE_RATE" &&
        hasRole(rolesStored, SecurityRole._CORPORATEACTIONS_ROLE),
    };

    const controlConfig = {
      showProceedRecipients: !isSecurityPaused && securityDetails?.type === "BOND_VARIABLE_RATE",
      showControlList: !isSecurityPaused && hasRole(rolesStored, SecurityRole._CONTROLLIST_ROLE),
      showKYC: !isSecurityPaused && hasRole(rolesStored, SecurityRole._KYC_ROLE),
      showSSIManager: !isSecurityPaused && hasRole(rolesStored, SecurityRole._SSI_MANAGER_ROLE),
      showFreeze: !isSecurityPaused && hasRole(rolesStored, SecurityRole._FREEZE_MANAGER_ROLE),
    };

    const managementConfig = {
      showRoleManagement: !isSecurityPaused,
      showDangerZone:
        hasRole(rolesStored, SecurityRole._CLEARING_ROLE) ||
        hasRole(rolesStored, SecurityRole._PAUSER_ROLE) ||
        hasRole(rolesStored, SecurityRole._INTERNAL_KYC_MANAGER_ROLE),
      showConfiguration: true,
    };

    const isLoadingTabs = isLoadingRoles || isLoadingSecurityDetails || isFetchingSecurityDetails;

    const showOperationTab = !isLoadingTabs && Object.values(operationsConfig).some((isVisible) => isVisible);

    const showCorporateActionsTab =
      !isLoadingTabs && Object.values(corporateActionsConfig).some((isVisible) => isVisible);

    const showControlTab = !isLoadingTabs && Object.values(controlConfig).some((isVisible) => isVisible);

    const showManagementTab = !isLoadingTabs && Object.values(managementConfig).some((isVisible) => isVisible);

    if (showOperationTab) {
      adminTabs.push({
        content: <OperationsTab config={operationsConfig} />,
        header: tTabs("operations"),
      });
    }

    if (showCorporateActionsTab) {
      adminTabs.push({
        content: <CorporateActionsTab config={corporateActionsConfig} />,
        header: tTabs("corporateActions"),
      });
    }

    if (showControlTab) {
      adminTabs.push({
        content: <ControlTab details={securityDetails ?? {}} config={controlConfig} />,
        header: tTabs("control"),
      });
    }

    if (showManagementTab) {
      adminTabs.push({
        content: <ManagementTab config={managementConfig} />,
        header: tTabs("management"),
      });
    }

    if (isLoadingTabs) {
      adminTabs.push({
        content: <></>,
        header: (
          <HStack>
            <Spinner />
            <Text>Loading</Text>
          </HStack>
        ),
      });
    }

    return adminTabs;
  }, [
    securityDetails,
    equityDetails,
    bondDetails,
    id,
    isLoadingSecurityDetails,
    isFetchingSecurityDetails,
    tTabs,
    userType,
    isPaused,
    isLoadingIsPaused,
    isLoadingRoles,
    rolesStored,
  ]);

  const tabsKey = useMemo(() => {
    return `tabs-${rolesStored.join("-")}-${tabs.length}`;
  }, [rolesStored, tabs.length]);

  return (
    <>
      <HStack align="flex-start" gap="54px">
        <History label={tHeader("title")} />
        {isPaused && <Tag label="Digital security paused" variant="paused" mt={1} />}
      </HStack>

      <Stack w="full" h="full" borderRadius={1} pt={6} gap={4}>
        <Tabs tabs={tabs} variant="primary" isLazy key={tabsKey} />
      </Stack>
    </>
  );
};
