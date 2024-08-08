import { HStack, Stack } from "@chakra-ui/react";
import { Tag } from "@hashgraph/asset-tokenization-uicomponents";
import { Tabs } from "@hashgraph/asset-tokenization-uicomponents/DataDisplay";
import { useTranslation } from "react-i18next";
import { History } from "../../components/History";
import { Details } from "./Components/Details";
import { Dividends } from "./Components/Dividends/Dividends";
import { Balance } from "./Components/Balance";
import { RoleManagement } from "./Components/RoleManagement/RoleManagement";
import { ControlList } from "./Components/ControlList";
import {
  GetSecurityDetailsRequest,
  GetRoleCountForRequest,
  GetRolesForRequest,
  PauseRequest,
  SecurityViewModel,
  GetEquityDetailsRequest,
  EquityDetailsViewModel,
  GetBondDetailsRequest,
  BondDetailsViewModel,
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
import { useWalletStore } from "../../store/walletStore";
import { useEffect, useMemo } from "react";
import { User } from "../../utils/constants";
import { useUserStore } from "../../store/userStore";
import { SecurityRole } from "../../utils/SecurityRole";
import { useRolesStore } from "../../store/rolesStore";
import { useSecurityStore } from "../../store/securityStore";
import { VotingRights } from "./Components/VotingRights/VotingRights";
import { Coupons } from "./Components/Coupons/Coupons";

export const DigitalSecurityDetails = () => {
  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "details.header",
  });
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.tabs",
  });
  const { id = "" } = useParams();
  const { address: walletAddress } = useWalletStore();
  const detailsRequest = new GetSecurityDetailsRequest({
    securityId: id,
  });
  useGetSecurityDetails(detailsRequest);
  const { type: userType } = useUserStore();
  const { setRoles, roles: accountRoles } = useRolesStore();
  const { details, setDetails } = useSecurityStore();

  useEffect(() => {
    setDetails(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GET EQUITY DETAILS
  const { data: equityDetails } = useGetEquityDetails(
    new GetEquityDetailsRequest({
      equityId: id,
    }),
    {
      retry: false,
    },
  );

  // GET BOND DETAILS
  const { data: bondDetails } = useGetBondDetails(
    new GetBondDetailsRequest({
      bondId: id,
    }),
    {
      retry: false,
    },
  );

  // ROLE COUNT FOR
  const roleCountForRequest = new GetRoleCountForRequest({
    securityId: id,
    targetId: walletAddress,
  });

  const { data: roleCountFor } =
    useGetSecurityRoleCountFor(roleCountForRequest);

  // ROLES FOR
  const rolesForRequest = new GetRolesForRequest({
    securityId: id,
    targetId: walletAddress,
    start: 0,
    end: roleCountFor ?? 0,
  });

  const { data: roles = [] } = useGetSecurityRolesFor(rolesForRequest, {
    enabled: !!roleCountFor,
    onSuccess: (roles) => setRoles(roles as SecurityRole[]),
  });

  // IS PAUSED
  const { data: isPaused } = useGetIsPaused(
    new PauseRequest({ securityId: id }),
  );

  const tabs = useMemo(() => {
    const holderTabs = [
      {
        content: (
          <Details
            id={id}
            detailsResponse={details ?? ({} as SecurityViewModel)}
            equityDetailsResponse={
              equityDetails ?? ({} as EquityDetailsViewModel)
            }
            bondDetailsResponse={bondDetails ?? ({} as BondDetailsViewModel)}
          />
        ),
        header: tTabs("details"),
      },
      {
        content: <Balance id={id} detailsResponse={details ?? {}} />,
        header: tTabs("balance"),
      },
    ];

    if (userType !== User.admin) return holderTabs;

    const adminTabs = [
      {
        content: (
          <Details
            id={id}
            detailsResponse={details ?? ({} as SecurityViewModel)}
            equityDetailsResponse={
              equityDetails ?? ({} as EquityDetailsViewModel)
            }
            bondDetailsResponse={bondDetails ?? ({} as BondDetailsViewModel)}
          />
        ),
        header: tTabs("details"),
      },
    ];

    const hasCorporateActionsRole = roles.find(
      (role) => role === SecurityRole._CORPORATEACTIONS_ROLE,
    );

    if (equityDetails?.dividendRight && hasCorporateActionsRole && !isPaused) {
      adminTabs.push({ content: <Dividends />, header: tTabs("dividends") });
    }

    adminTabs.push({
      content: <Balance id={id} detailsResponse={details ?? {}} />,
      header: tTabs("balance"),
    });

    const hasControllerListRole = roles.find(
      (role) => role === SecurityRole._CONTROLLIST_ROLE,
    );

    if (hasControllerListRole && !isPaused) {
      adminTabs.push({
        content: <ControlList />,
        header: details?.isWhiteList
          ? tTabs("allowedList")
          : tTabs("blockedList"),
      });
    }

    if (equityDetails?.votingRight && hasCorporateActionsRole && !isPaused) {
      adminTabs.push({
        content: <VotingRights />,
        header: tTabs("votingRights"),
      });
    }

    if (!isPaused) {
      adminTabs.push({
        content: <RoleManagement />,
        header: tTabs("roleManagement"),
      });
    }

    if (bondDetails && hasCorporateActionsRole && !isPaused) {
      adminTabs.push({ content: <Coupons />, header: tTabs("coupons") });
    }

    return adminTabs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, id, roles, isPaused, accountRoles]);

  return (
    <>
      <HStack align="flex-start" gap="54px">
        <History label={tHeader("title")} />
        {isPaused && (
          <Tag label="Digital security paused" variant="paused" mt={1} />
        )}
      </HStack>
      <Stack w="full" h="full" borderRadius={1} pt={6} gap={4}>
        <Tabs tabs={tabs} />
      </Stack>
    </>
  );
};
