import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import {
  BalanceViewModel,
  DividendsViewModel,
  GetAccountBalanceRequest,
  GetAllDividendsRequest,
  GetSecurityDetailsRequest,
  GetRoleCountForRequest,
  GetRolesForRequest,
  PauseRequest,
  SecurityViewModel,
  GetRoleMemberCountRequest,
  GetRoleMembersRequest,
  EquityDetailsViewModel,
  GetEquityDetailsRequest,
  GetMaxSupplyRequest,
  MaxSupplyViewModel,
  GetBondDetailsRequest,
  BondDetailsViewModel,
  GetRegulationDetailsRequest,
  RegulationViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { useSecurityStore } from "../../store/securityStore";
import { SecurityRole } from "../../utils/SecurityRole";

export const GET_SECURITY_DETAILS = (equityId: string) =>
  `GET_SECURITY_DETAILS${equityId}`;

export const GET_SECURITY_ROLE_COUNT_FOR = (
  securityId: string,
  targetId: string,
) => `GET_SECURITY_ROLES${securityId}_${targetId}`;

export const GET_ROLE_MEMBER_COUNT = (securityId: string, role: string) =>
  `GET_ROLE_MEMBER_COUNT_${securityId}_${role}`;

export const GET_ROLE_MEMBERS = (
  securityId: string,
  role: SecurityRole,
  start: number,
  end: number,
) => `GET_ROLE_MEMBERS_${securityId}_${role}_${start}_${end}`;

export const GET_SECURITY_BALANCE_OF = (securityId: string, targetId: string) =>
  `GET_SECURITY_BALANCE_OF${securityId}_${targetId}`;

export const GET_SECURITY_ROLES_FOR = (
  securityId: string,
  targetId: string,
  start: number,
  end: number,
) => `GET_SECURITY_ROLES${securityId}_${targetId}_${start}_${end}`;

export const GET_SECURITY_DIVIDENS = (securityId: string) =>
  `GET_SECURITY_DIVIDENS${securityId}`;

export const GET_IS_PAUSED = (securityId: string) =>
  `GET_IS_PAUSED${securityId}`;

export const GET_EQUITY_DETAILS = (equityId: string) =>
  `GET_EQUITY_DETAILS${equityId}`;

export const GET_BOND_DETAILS = (bondId: string) => `GET_BOND_DETAILS${bondId}`;

export const GET_MAX_SUPPLY = (securityId: string) =>
  `GET_MAX_SUPPLY${securityId}`;

export const GET_REGULATION_DETAILS = (
  regulationType: number,
  regulationSubType: number,
) => `GET_REGULATION_DETAILS${regulationType}_${regulationSubType}`;

export const useGetSecurityDetails = <TError, TData = SecurityViewModel>(
  request: GetSecurityDetailsRequest,
  options?: UseQueryOptions<SecurityViewModel, TError, TData, [string]>,
) => {
  const { setDetails } = useSecurityStore();
  return useQuery(
    [GET_SECURITY_DETAILS(request.securityId)],
    () => SDKService.getSecurityDetails(request),
    {
      onSuccess: (data) => {
        setDetails(data as SecurityViewModel);
      },
      ...options,
    },
  );
};

export const useGetSecurityRoleCountFor = <TError, TData = number>(
  params: GetRoleCountForRequest,
  options?: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_ROLE_COUNT_FOR(params.securityId, params.targetId)],
    () => SDKService.getRoleCountFor(params),
    options,
  );
};

export const useGetBalanceOf = <TError, TData = BalanceViewModel>(
  params: GetAccountBalanceRequest,
  options?: UseQueryOptions<BalanceViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_BALANCE_OF(params.securityId, params.targetId)],
    () => SDKService.getBalanceOf(params),
    options,
  );
};

export const useGetSecurityRolesFor = <TError, TData = string[]>(
  params: GetRolesForRequest,
  options?: UseQueryOptions<string[], TError, TData, [string]>,
) => {
  return useQuery(
    [
      GET_SECURITY_ROLES_FOR(
        params.securityId,
        params.targetId,
        params.start,
        params.end,
      ),
    ],
    () => SDKService.getRolesFor(params),
    options,
  );
};

export const useGetAllDividends = <TError, TData = DividendsViewModel[]>(
  request: GetAllDividendsRequest,
  options?: UseQueryOptions<DividendsViewModel[], TError, TData, [string]>,
) => {
  return useQuery(
    [GET_SECURITY_DIVIDENS(request.securityId)],
    () => SDKService.getAllDividends(request),
    options,
  );
};

export const useGetIsPaused = <TError, TData = boolean>(
  params: PauseRequest,
  options?: UseQueryOptions<boolean, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_IS_PAUSED(params.securityId)],
    () => SDKService.isPaused(params),
    {
      cacheTime: 0,
      ...options,
    },
  );
};

export const useGetRoleMemberCount = <TError, TData = number>(
  params: GetRoleMemberCountRequest,
  options?: UseQueryOptions<number, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_ROLE_MEMBER_COUNT(params.securityId, params.role!)],
    () => SDKService.getRoleMemberCount(params),
    options,
  );
};

export const useGetRoleMembers = <TError, TData = string[]>(
  params: GetRoleMembersRequest,
  options?: UseQueryOptions<string[], TError, TData, [string]>,
) => {
  return useQuery(
    [
      GET_ROLE_MEMBERS(
        params.securityId,
        params.role!,
        params.start,
        params.end,
      ),
    ],
    () => SDKService.getRoleMembers(params),
    options,
  );
};

export const useGetEquityDetails = <TError, TData = EquityDetailsViewModel>(
  request: GetEquityDetailsRequest,
  options?: UseQueryOptions<EquityDetailsViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_EQUITY_DETAILS(request.equityId)],
    () => SDKService.getEquityDetails(request),
    options,
  );
};

export const useGetBondDetails = <TError, TData = BondDetailsViewModel>(
  request: GetBondDetailsRequest,
  options?: UseQueryOptions<BondDetailsViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_BOND_DETAILS(request.bondId)],
    () => SDKService.getBondDetails(request),
    options,
  );
};

export const useGetMaxSupply = <TError, TData = MaxSupplyViewModel>(
  request: GetMaxSupplyRequest,
  options?: UseQueryOptions<MaxSupplyViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_MAX_SUPPLY(request.securityId)],
    () => SDKService.getMaxSupply(request),
    options,
  );
};

export const useGetRegulationDetails = <TError, TData = RegulationViewModel>(
  request: GetRegulationDetailsRequest,
  options?: UseQueryOptions<RegulationViewModel, TError, TData, [string]>,
) => {
  return useQuery(
    [GET_REGULATION_DETAILS(request.regulationType, request.regulationSubType)],
    () => SDKService.getRegulationDetails(request),
    options,
  );
};
