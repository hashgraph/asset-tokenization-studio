// SPDX-License-Identifier: Apache-2.0

import IssueRequest from "./security/operations/issue/IssueRequest";
import RedeemRequest from "./security/operations/redeem/RedeemRequest";
import ForceRedeemRequest from "./security/operations/redeem/ForceRedeemRequest";
import CreateEquityRequest from "./equity/CreateEquityRequest";
import CreateBondRequest from "./bond/CreateBondRequest";
import CreateBondFixedRateRequest from "./bond/CreateBondFixedRateRequest";
import RoleRequest from "./security/roles/RoleRequest";
import ApplyRolesRequest from "./security/roles/ApplyRolesRequest";
import ValidationResponse from "@core/validation/ValidationResponse";
import TransferRequest from "./security/operations/transfer/TransferRequest";
import TransferAndLockRequest from "./security/operations/transfer/TransferAndLockRequest";
import ForceTransferRequest from "./security/operations/transfer/ForceTransferRequest";
import GetAccountBalanceRequest from "./account/GetAccountBalanceRequest";
import GetAccountInfoRequest from "./account/GetAccountInfoRequest";
import PauseRequest from "./security/operations/pause/PauseRequest";
import ControlListRequest from "./security/operations/controlList/ControlListRequest";
import GetControlListCountRequest from "./security/operations/controlList/GetControlListCountRequest";
import GetControlListMembersRequest from "./security/operations/controlList/GetControlListMembersRequest";
import GetDividendsForRequest from "./equity/GetDividendsForRequest";
import GetDividendsRequest from "./equity/GetDividendsRequest";
import GetAllDividendsRequest from "./equity/GetAllDividendsRequest";
import GetVotingRightsForRequest from "./equity/GetVotingRightsForRequest";
import GetVotingRightsRequest from "./equity/GetVotingRightsRequest";
import GetAllVotingRightsRequest from "./equity/GetAllVotingRightsRequest";
import GetCouponForRequest from "./bond/GetCouponForRequest";
import GetCouponRequest from "./bond/GetCouponRequest";
import GetCouponsOrderedListRequest from "./bond/GetCouponsOrderedListRequest";
import GetCouponsOrderedListTotalRequest from "./bond/GetCouponsOrderedListTotalRequest";
import GetAllCouponsRequest from "./bond/GetAllCouponsRequest";
import GetRoleCountForRequest from "./security/roles/GetRoleCountForRequest";
import GetRolesForRequest from "./security/roles/GetRolesForRequest";
import GetRoleMemberCountRequest from "./security/roles/GetRoleMemberCountRequest";
import GetRoleMembersRequest from "./security/roles/GetRoleMembersRequest";
import GetSecurityDetailsRequest from "./security/GetSecurityDetailsRequest";
import SetDividendsRequest from "./equity/SetDividendsRequest";
import SetCouponRequest from "./bond/SetCouponRequest";
import SetVotingRightsRequest from "./equity/SetVotingRightsRequest";
import GetBondDetailsRequest from "./bond/GetBondDetailsRequest";
import GetEquityDetailsRequest from "./equity/GetEquityDetailsRequest";
import SetMaxSupplyRequest from "./security/operations/cap/SetMaxSupplyRequest";
import GetMaxSupplyRequest from "./security/operations/cap/GetMaxSupplyRequest";
import GetRegulationDetailsRequest from "./factory/GetRegulationDetailsRequest";
import GetLockedBalanceRequest from "./security/operations/lock/GetLockedBalanceRequest";
import LockRequest from "./security/operations/lock/LockRequest";
import ReleaseRequest from "./security/operations/release/ReleaseRequest";
import GetLockCountRequest from "./security/operations/lock/GetLockCountRequest";
import GetLocksIdRequest from "./security/operations/lock/GetLocksIdRequest";
import GetLockRequest from "./security/operations/lock/GetLockRequest";
import ExecuteHoldByPartitionRequest from "./security/operations/hold/ExecuteHoldByPartitionRequest";

import GetControlListTypeRequest from "./security/operations/controlList/GetControlListTypeRequest";
import InitializationRequest from "./network/InitializationRequest";
import ConnectRequest from "./network/ConnectRequest";
import GetConfigInfoRequest from "./management/GetConfigInfoRequest";
import UpdateConfigRequest from "./management/UpdateConfigRequest";
import UpdateConfigVersionRequest from "./management/UpdateConfigVersionRequest";
import UpdateResolverRequest from "./management/UpdateResolverRequest";
import UpdateMaturityDateRequest from "./bond/UpdateMaturityDateRequest";
import SetScheduledBalanceAdjustmentRequest from "./equity/SetScheduledBalanceAdjustmentRequest";
import GetScheduledBalanceAdjustmentRequest from "./equity/GetScheduledBalanceAdjustmentRequest";
import GetScheduledBalanceAdjustmentCountRequest from "./equity/GetScheduledBalanceAdjustmentsCountRequest";
import GetAllScheduledBalanceAdjustmentsRequest from "./equity/GetAllScheduledBalanceAdjustmentst";
import GetLastAggregatedBalanceAdjustmentFactorForRequest from "./equity/GetLastAggregatedBalanceAdjustmentFactorForRequest";
import GetAggregatedBalanceAdjustmentFactorRequest from "./account/GetAggregatedBalanceAdjustmentFactorRequest";
import GetLastAggregatedBalanceAdjustmentFactorForByPartitionRequest from "./equity/GetLastAggregatedBalanceAdjustmentFactorForByPartitionRequest";
import ProtectedTransferFromByPartitionRequest from "./security/operations/transfer/ProtectedTransferFromByPartitionRequest";
import ProtectedRedeemFromByPartitionRequest from "./security/operations/redeem/ProtectedRedeemFromByPartitionRequest";
import GetNounceRequest from "./security/operations/protectedPartitions/GetNounceRequest";
import PartitionsProtectedRequest from "./security/operations/protectedPartitions/PartitionsProtectedRequest";
import CreateHoldByPartitionRequest from "./security/operations/hold/CreateHoldByPartition";
import CreateHoldFromByPartitionRequest from "./security/operations/hold/CreateHoldFromByPartition";
import ControllerCreateHoldByPartitionRequest from "./security/operations/hold/ControllerCreateHoldFromByPartition";
import ProtectedCreateHoldByPartitionRequest from "./security/operations/hold/ProtectedCreateHoldFromByPartition";
import GetHeldAmountForRequest from "./security/operations/hold/GetHeldAmountForRequest";
import GetHeldAmountForByPartitionRequest from "./security/operations/hold/GetHeldAmountForByPartitionRequest";
import GetHoldCountForByPartitionRequest from "./security/operations/hold/GetHoldCountForByPartitionRequest";
import GetHoldsIdForByPartitionRequest from "./security/operations/hold/GetHoldsIdForByPartitionRequest";
import GetHoldForByPartitionRequest from "./security/operations/hold/GetHoldForByPartitionRequest";
import ReleaseHoldByPartitionRequest from "./security/operations/release/ReleaseHoldByPartitionRequest";
import ReclaimHoldByPartitionRequest from "./security/operations/hold/ReclaimHoldByPartitionRequest";
import AddIssuerRequest from "./security/ssi/AddIssuerRequest";
import SetRevocationRegistryAddressRequest from "./security/ssi/SetRevocationRegistryAddressRequest";
import RemoveIssuerRequest from "./security/operations/issue/RemoveIssuerRequest";
import GetRevocationRegistryAddressRequest from "./security/ssi/GetRevocationRegistryAddressRequest";
import GetIssuerListCountRequest from "./security/ssi/GetIssuerListCountRequest";
import GetIssuerListMembersRequest from "./security/ssi/GetIssuerListMembersRequest";
import IsIssuerRequest from "./security/operations/issue/IsIssuerRequest";
import GetKycAccountsCountRequest from "./security/kyc/GetKycAccountsCountRequest";
import GetKycForRequest from "./security/kyc/GetKycForRequest";
import RevokeKycRequest from "./security/kyc/RevokeKycRequest";
import GrantKycRequest from "./security/kyc/GrantKycRequest";
import GetKycAccountsDataRequest from "./security/kyc/GetKycAccountsDataRequest";
import GetKycStatusForRequest from "./security/kyc/GetKycStatusForRequest";
import ActivateClearingRequest from "./security/operations/clearing/ActivateClearingRequest";
import DeactivateClearingRequest from "./security/operations/clearing/DeactivateClearingRequest";
import ClearingTransferByPartitionRequest from "./security/operations/clearing/ClearingTransferByPartitionRequest";
import ClearingTransferFromByPartitionRequest from "./security/operations/clearing/ClearingTransferFromByPartitionRequest";
import ProtectedClearingTransferByPartitionRequest from "./security/operations/clearing/ProtectedClearingTransferByPartitionRequest";
import ApproveClearingOperationByPartitionRequest from "./security/operations/clearing/ApproveClearingOperationByPartitionRequest";
import CancelClearingOperationByPartitionRequest from "./security/operations/clearing/CancelClearingOperationByPartitionRequest";
import ReclaimClearingOperationByPartitionRequest from "./security/operations/clearing/ReclaimClearingOperationByPartitionRequest";
import ClearingRedeemByPartitionRequest from "./security/operations/clearing/ClearingRedeemByPartitionRequest";
import ClearingRedeemFromByPartitionRequest from "./security/operations/clearing/ClearingRedeemFromByPartitionRequest";
import ProtectedClearingRedeemByPartitionRequest from "./security/operations/clearing/ProtectedClearingRedeemByPartitionRequest";
import ClearingCreateHoldByPartitionRequest from "./security/operations/clearing/ClearingCreateHoldByPartitionRequest";
import ClearingCreateHoldFromByPartitionRequest from "./security/operations/clearing/ClearingCreateHoldFromByPartitionRequest";
import ProtectedClearingCreateHoldByPartitionRequest from "./security/operations/clearing/ProtectedClearingCreateHoldByPartitionRequest";
import GetClearedAmountForByPartitionRequest from "./security/operations/clearing/GetClearedAmountForByPartitionRequest";
import GetClearedAmountForRequest from "./security/operations/clearing/GetClearedAmountForRequest";
import GetClearingCountForByPartitionRequest from "./security/operations/clearing/GetClearingCountForByPartitionRequest";
import GetClearingsIdForByPartitionRequest from "./security/operations/clearing/GetClearingsIdForByPartitionRequest";
import IsClearingActivatedRequest from "./security/operations/clearing/IsClearingActivatedRequest";
import OperatorClearingCreateHoldByPartitionRequest from "./security/operations/clearing/OperatorClearingCreateHoldByPartitionRequest";
import OperatorClearingRedeemByPartitionRequest from "./security/operations/clearing/OperatorClearingRedeemByPartitionRequest";
import OperatorClearingTransferByPartitionRequest from "./security/operations/clearing/OperatorClearingTransferByPartitionRequest";
import GetClearingCreateHoldForByPartitionRequest from "./security/operations/clearing/GetClearingCreateHoldForByPartitionRequest";
import GetClearingRedeemForByPartitionRequest from "./security/operations/clearing/GetClearingRedeemForByPartitionRequest";
import GetClearingTransferForByPartitionRequest from "./security/operations/clearing/GetClearingTransferForByPartitionRequest";
import UpdateExternalPausesRequest from "./security/externalPauses/UpdateExternalPausesRequest";
import AddExternalPauseRequest from "./security/externalPauses/AddExternalPauseRequest";
import RemoveExternalPauseRequest from "./security/externalPauses/RemoveExternalPauseRequest";
import IsExternalPauseRequest from "./security/externalPauses/IsExternalPauseRequest";
import GetExternalPausesCountRequest from "./security/externalPauses/GetExternalPausesCountRequest";
import GetExternalPausesMembersRequest from "./security/externalPauses/GetExternalPausesMembersRequest";
import IsPausedMockRequest from "./security/externalPauses/mock/IsPausedMockRequest";
import SetPausedMockRequest from "./security/externalPauses/mock/SetPausedMockRequest";
import UpdateExternalControlListsRequest from "./security/externalControlLists/UpdateExternalControlListsRequest";
import AddExternalControlListRequest from "./security/externalControlLists/AddExternalControlListRequest";
import RemoveExternalControlListRequest from "./security/externalControlLists/RemoveExternalControlListRequest";
import GetExternalControlListsCountRequest from "./security/externalControlLists/GetExternalControlListsCountRequest";
import IsExternalControlListRequest from "./security/externalControlLists/IsExternalControlListRequest";
import GetExternalControlListsMembersRequest from "./security/externalControlLists/GetExternalControlListsMembersRequest";
import AddToBlackListMockRequest from "./security/externalControlLists/mock/AddToBlackListMockRequest";
import AddToWhiteListMockRequest from "./security/externalControlLists/mock/AddToWhiteListMockRequest";
import RemoveFromBlackListMockRequest from "./security/externalControlLists/mock/RemoveFromBlackListMockRequest";
import RemoveFromWhiteListMockRequest from "./security/externalControlLists/mock/RemoveFromWhiteListMockRequest";
import IsAuthorizedBlackListMockRequest from "./security/externalControlLists/mock/IsAuthorizedBlackListMockRequest";
import IsAuthorizedWhiteListMockRequest from "./security/externalControlLists/mock/IsAuthorizedWhiteListMockRequest";
import UpdateExternalKycListsRequest from "./security/externalKycLists/UpdateExternalKycListsRequest";
import AddExternalKycListRequest from "./security/externalKycLists/AddExternalKycListRequest";
import RemoveExternalKycListRequest from "./security/externalKycLists/RemoveExternalKycListRequest";
import GetExternalKycListsCountRequest from "./security/externalKycLists/GetExternalKycListsCountRequest";
import GetExternalKycListsMembersRequest from "./security/externalKycLists/GetExternalKycListsMembersRequest";
import IsExternalKycListRequest from "./security/externalKycLists/IsExternalKycListRequest";
import IsExternallyGrantedRequest from "./security/externalKycLists/IsExternallyGrantedRequest";
import ActivateInternalKycRequest from "./security/kyc/ActivateInternalKycRequest";
import IsInternalKycActivatedRequest from "./security/kyc/IsInternalKycActivatedRequest";
import GrantKycMockRequest from "./security/externalKycLists/mock/GrantKycMockRequest";
import RevokeKycMockRequest from "./security/externalKycLists/mock/RevokeKycMockRequest";
import GetKycStatusMockRequest from "./security/externalKycLists/mock/GetKycStatusMockRequest";
import SetNameRequest from "./security/operations/tokeMetadata/SetNameRequest";
import SetSymbolRequest from "./security/operations/tokeMetadata/SetSymbolRequest";
import SetOnchainIDRequest from "./security/operations/tokeMetadata/SetOnchainIDRequest";
import SetComplianceRequest from "./security/compliance/SetComplianceRequest";
import ComplianceRequest from "./security/compliance/ComplianceRequest";
import SetIdentityRegistryRequest from "./security/identityRegistry/SetIdentityRegistryRequest";
import IdentityRegistryRequest from "./security/identityRegistry/IdentityRegistryRequest";
import OnchainIDRequest from "./security/operations/tokeMetadata/OnchainIDRequest";
import BurnRequest from "./security/operations/burn/BurnRequest";
import MintRequest from "./security/operations/mint/MintRequest";
import RecoveryAddressRequest from "./security/operations/recovery/RecoveryAddressRequest";
import IsAddressRecoveredRequest from "./security/operations/recovery/IsAddressRecoveredRequest";
import ForcedTransferRequest from "./security/operations/transfer/ForcedTransferRequest";
import FreezePartialTokensRequest from "./security/operations/freeze/FreezePartialTokensRequest";
import GetFrozenPartialTokensRequest from "./security/operations/freeze/GetFrozenPartialTokensRequest";
import UnfreezePartialTokensRequest from "./security/operations/freeze/UnfreezePartialTokensRequest";
import AddAgentRequest from "./security/operations/agent/AddAgentRequest";
import RemoveAgentRequest from "./security/operations/agent/RemoveAgentRequest";
import BatchBurnRequest from "./security/operations/batch/BatchBurnRequest";
import BatchForcedTransferRequest from "./security/operations/batch/BatchForcedTransferRequest";
import BatchFreezePartialTokensRequest from "./security/operations/batch/BatchFreezePartialTokensRequest";
import BatchMintRequest from "./security/operations/batch/BatchMintRequest";
import BatchSetAddressFrozenRequest from "./security/operations/batch/BatchSetAddressFrozenRequest";
import BatchTransferRequest from "./security/operations/batch/BatchTransferRequest";
import BatchUnfreezePartialTokensRequest from "./security/operations/batch/BatchUnfreezePartialTokensRequest";
import SetAddressFrozenRequest from "./security/operations/freeze/SetAddressFrozenRequest";
import DeactivateInternalKycRequest from "./security/kyc/DeactivateInternalKycRequest";
import TakeSnapshotRequest from "./security/operations/snapshot/TakeSnapshotRequest";
import RedeemAtMaturityByPartitionRequest from "./bond/RedeemAtMaturityByPartitionRequest";
import FullRedeemAtMaturityRequest from "./bond/FullRedeemAtMaturityRequest";
import GetTokenHoldersAtSnapshotRequest from "./security/operations/snapshot/GetTokenHoldersAtSnapshotRequest";
import GetTotalTokenHoldersAtSnapshotRequest from "./security/operations/snapshot/GetTotalTokenHoldersAtSnapshotRequest";
import GetCouponHoldersRequest from "./bond/GetCouponHoldersRequest";
import GetTotalCouponHoldersRequest from "./bond/GetTotalCouponHoldersRequest";
import GetDividendHoldersRequest from "./equity/GetDividendHoldersRequest";
import GetTotalDividendHoldersRequest from "./equity/GetTotalDividendHoldersRequest";
import GetTotalVotingHoldersRequest from "./equity/GetTotalVotingHoldersRequest";
import GetVotingHoldersRequest from "./equity/GetVotingHoldersRequest";
import GetSecurityHoldersRequest from "./security/GetSecurityHoldersRequest";
import GetTotalSecurityHoldersRequest from "./security/GetTotalSecurityHoldersRequest";
import CreateTrexSuiteEquityRequest from "./equity/CreateTrexSuiteEquityRequest";
import CreateTrexSuiteBondRequest from "./bond/CreateTrexSuiteBondRequest";
import AddProceedRecipientRequest from "./bond/AddProceedRecipientRequest";
import RemoveProceedRecipientRequest from "./bond/RemoveProceedRecipientRequest";
import UpdateProceedRecipientDataRequest from "./bond/UpdateProceedRecipientDataRequest";
import GetProceedRecipientDataRequest from "./bond/GetProceedRecipientDataRequest";
import GetProceedRecipientsCountRequest from "./bond/GetProceedRecipientsCountRequest";
import GetProceedRecipientsRequest from "./bond/GetProceedRecipientsRequest";
import IsProceedRecipientRequest from "./bond/IsProceedRecipientRequest";
import GetCouponFromOrderedListAtRequest from "./bond/GetCouponFromOrderedListAtRequest";
import GetPrincipalForRequest from "./bond/GetPrincipalForRequest";
import ActionContentHashExistsRequest from "./security/operations/corporateActions/ActionContentHashExistsRequest";
import SetRateRequest from "@port/in/request/interestRates/SetRateRequest";
import GetRateRequest from "@port/in/request/interestRates/GetRateRequest";
import GetInterestRateRequest from "@port/in/request/interestRates/GetInterestRateRequest";
import ScheduledCouponListingCountRequest from "@port/in/request/scheduledTasks/ScheduledCouponListingCountRequest";
import CreateBondKpiLinkedRateRequest from "./bond/CreateBondKpiLinkedRateRequest";
import GetLatestKpiDataRequest from "./kpis/GetLatestKpiDataRequest";
import GetMinDateRequest from "./kpis/GetMinDateRequest";
import IsCheckPointDateRequest from "./kpis/IsCheckPointDateRequest";
import { AddKpiDataRequest } from "./kpis/AddKpiDataRequest";
import GetImpactDataRequest from "./kpiLinkedRate/GetImpactDataRequest";
import GetScheduledCouponListingRequest from "./scheduledTasks/GetScheduledCouponListingRequest";

export {
  CreateEquityRequest,
  CreateBondRequest,
  CreateBondFixedRateRequest,
  CreateBondKpiLinkedRateRequest,
  ValidationResponse,
  IssueRequest,
  RedeemRequest,
  BurnRequest,
  ForceRedeemRequest,
  RoleRequest,
  ApplyRolesRequest,
  TransferRequest,
  ForceTransferRequest,
  ForcedTransferRequest,
  MintRequest,
  ControlListRequest,
  GetControlListCountRequest,
  GetControlListMembersRequest,
  GetDividendsForRequest,
  GetDividendsRequest,
  GetAllDividendsRequest,
  GetVotingRightsForRequest,
  GetVotingRightsRequest,
  GetAllVotingRightsRequest,
  GetCouponForRequest,
  GetCouponFromOrderedListAtRequest,
  GetPrincipalForRequest,
  GetCouponRequest,
  GetCouponsOrderedListRequest,
  GetCouponsOrderedListTotalRequest,
  GetAllCouponsRequest,
  GetRoleCountForRequest,
  GetRolesForRequest,
  GetRoleMemberCountRequest,
  GetRoleMembersRequest,
  SetDividendsRequest,
  SetCouponRequest,
  SetVotingRightsRequest,
  GetAccountBalanceRequest,
  GetAccountInfoRequest,
  PauseRequest,
  GetControlListTypeRequest,
  InitializationRequest,
  ConnectRequest,
  GetSecurityDetailsRequest,
  GetBondDetailsRequest,
  SetMaxSupplyRequest,
  GetMaxSupplyRequest,
  GetEquityDetailsRequest,
  GetRegulationDetailsRequest,
  GetLockedBalanceRequest,
  LockRequest,
  ReleaseRequest,
  GetLockCountRequest,
  GetLocksIdRequest,
  GetLockRequest,
  TransferAndLockRequest,
  UpdateResolverRequest,
  UpdateConfigVersionRequest,
  UpdateConfigRequest,
  GetConfigInfoRequest,
  UpdateMaturityDateRequest,
  SetScheduledBalanceAdjustmentRequest,
  GetScheduledBalanceAdjustmentRequest,
  GetScheduledBalanceAdjustmentCountRequest,
  GetAllScheduledBalanceAdjustmentsRequest,
  GetLastAggregatedBalanceAdjustmentFactorForRequest,
  GetAggregatedBalanceAdjustmentFactorRequest,
  GetLastAggregatedBalanceAdjustmentFactorForByPartitionRequest,
  ProtectedTransferFromByPartitionRequest,
  ProtectedRedeemFromByPartitionRequest,
  GetNounceRequest,
  PartitionsProtectedRequest,
  CreateHoldByPartitionRequest,
  CreateHoldFromByPartitionRequest,
  ControllerCreateHoldByPartitionRequest,
  ProtectedCreateHoldByPartitionRequest,
  GetHeldAmountForRequest,
  GetHeldAmountForByPartitionRequest,
  GetHoldCountForByPartitionRequest,
  GetHoldsIdForByPartitionRequest,
  GetHoldForByPartitionRequest,
  ReleaseHoldByPartitionRequest,
  ReclaimHoldByPartitionRequest,
  ExecuteHoldByPartitionRequest,
  AddIssuerRequest,
  SetRevocationRegistryAddressRequest,
  RemoveIssuerRequest,
  GetRevocationRegistryAddressRequest,
  GetIssuerListCountRequest,
  GetIssuerListMembersRequest,
  IsIssuerRequest,
  GetKycAccountsCountRequest,
  GetKycForRequest,
  RevokeKycRequest,
  GrantKycRequest,
  GetKycAccountsDataRequest,
  GetKycStatusForRequest,
  ActivateClearingRequest,
  DeactivateClearingRequest,
  ClearingTransferByPartitionRequest,
  ClearingTransferFromByPartitionRequest,
  ProtectedClearingTransferByPartitionRequest,
  ApproveClearingOperationByPartitionRequest,
  CancelClearingOperationByPartitionRequest,
  ReclaimClearingOperationByPartitionRequest,
  ClearingRedeemByPartitionRequest,
  ClearingRedeemFromByPartitionRequest,
  ProtectedClearingRedeemByPartitionRequest,
  ClearingCreateHoldByPartitionRequest,
  ClearingCreateHoldFromByPartitionRequest,
  ProtectedClearingCreateHoldByPartitionRequest,
  GetClearedAmountForByPartitionRequest,
  GetClearedAmountForRequest,
  GetClearingCountForByPartitionRequest,
  GetClearingCreateHoldForByPartitionRequest,
  GetClearingRedeemForByPartitionRequest,
  GetClearingTransferForByPartitionRequest,
  GetClearingsIdForByPartitionRequest,
  IsClearingActivatedRequest,
  OperatorClearingCreateHoldByPartitionRequest,
  OperatorClearingRedeemByPartitionRequest,
  OperatorClearingTransferByPartitionRequest,
  UpdateExternalPausesRequest,
  AddExternalPauseRequest,
  RemoveExternalPauseRequest,
  IsExternalPauseRequest,
  GetExternalPausesCountRequest,
  GetExternalPausesMembersRequest,
  IsPausedMockRequest,
  SetPausedMockRequest,
  UpdateExternalControlListsRequest,
  AddExternalControlListRequest,
  RemoveExternalControlListRequest,
  GetExternalControlListsCountRequest,
  IsExternalControlListRequest,
  GetExternalControlListsMembersRequest,
  AddToBlackListMockRequest,
  AddToWhiteListMockRequest,
  RemoveFromBlackListMockRequest,
  RemoveFromWhiteListMockRequest,
  IsAuthorizedBlackListMockRequest,
  IsAuthorizedWhiteListMockRequest,
  UpdateExternalKycListsRequest,
  AddExternalKycListRequest,
  RemoveExternalKycListRequest,
  GetExternalKycListsCountRequest,
  GetExternalKycListsMembersRequest,
  IsExternalKycListRequest,
  IsExternallyGrantedRequest,
  ActivateInternalKycRequest,
  DeactivateInternalKycRequest,
  IsInternalKycActivatedRequest,
  GrantKycMockRequest,
  RevokeKycMockRequest,
  GetKycStatusMockRequest,
  SetNameRequest,
  SetSymbolRequest,
  SetOnchainIDRequest,
  SetComplianceRequest,
  SetIdentityRegistryRequest,
  ComplianceRequest,
  IdentityRegistryRequest,
  OnchainIDRequest,
  FreezePartialTokensRequest,
  GetFrozenPartialTokensRequest,
  UnfreezePartialTokensRequest,
  RecoveryAddressRequest,
  IsAddressRecoveredRequest,
  AddAgentRequest,
  RemoveAgentRequest,
  BatchBurnRequest,
  BatchForcedTransferRequest,
  BatchFreezePartialTokensRequest,
  BatchMintRequest,
  BatchSetAddressFrozenRequest,
  BatchTransferRequest,
  BatchUnfreezePartialTokensRequest,
  SetAddressFrozenRequest,
  TakeSnapshotRequest,
  RedeemAtMaturityByPartitionRequest,
  FullRedeemAtMaturityRequest,
  GetTokenHoldersAtSnapshotRequest,
  GetTotalTokenHoldersAtSnapshotRequest,
  GetCouponHoldersRequest,
  GetTotalCouponHoldersRequest,
  GetDividendHoldersRequest,
  GetTotalDividendHoldersRequest,
  GetVotingHoldersRequest,
  GetTotalVotingHoldersRequest,
  GetSecurityHoldersRequest,
  GetTotalSecurityHoldersRequest,
  CreateTrexSuiteBondRequest,
  CreateTrexSuiteEquityRequest,
  AddProceedRecipientRequest,
  RemoveProceedRecipientRequest,
  UpdateProceedRecipientDataRequest,
  IsProceedRecipientRequest,
  GetProceedRecipientDataRequest,
  GetProceedRecipientsCountRequest,
  GetProceedRecipientsRequest,
  ActionContentHashExistsRequest,
  SetRateRequest,
  GetRateRequest,
  GetInterestRateRequest,
  ScheduledCouponListingCountRequest as ScheduledCouponListingCountRequest,
  GetLatestKpiDataRequest,
  GetMinDateRequest,
  IsCheckPointDateRequest,
  AddKpiDataRequest,
  GetImpactDataRequest,
  GetScheduledCouponListingRequest,
};
