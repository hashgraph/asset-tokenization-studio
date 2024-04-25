import {
  GetAccountBalanceRequest,
  GetSecurityDetailsRequest,
} from "@hashgraph/securitytoken-sdk";
import {
  useGetBalanceOf,
  useGetSecurityDetails,
} from "./queries/useGetSecurityDetails";

export const useDetailsBalancePanel = (
  securityId: string,
  targetId: string,
) => {
  const {
    data: currentAvailableBalance,
    refetch: refetchCurrentAvailableBalance,
    isFetching: isCurrentAvailableBalanceLoading,
  } = useGetBalanceOf(
    new GetAccountBalanceRequest({
      securityId,
      targetId,
    }),
    {
      enabled: !!securityId && !!targetId,
    },
  );

  const detailsRequest = new GetSecurityDetailsRequest({
    securityId,
  });

  const { refetch: refetchDetails, isFetching: isSecurityDetailsLoading } =
    useGetSecurityDetails(detailsRequest, {
      enabled: !!securityId,
    });

  const update = () => {
    refetchCurrentAvailableBalance();
    refetchDetails();
  };

  return {
    isCurrentAvailableBalanceLoading,
    isSecurityDetailsLoading,
    isLoading: isCurrentAvailableBalanceLoading || isSecurityDetailsLoading,
    currentAvailableBalance,
    update,
  };
};
