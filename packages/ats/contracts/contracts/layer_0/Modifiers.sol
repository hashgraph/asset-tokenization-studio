// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LocalContext } from "./context/LocalContext.sol";
import { IKyc } from "../layer_1/interfaces/kyc/IKyc.sol";
import { IKpiLinkedRate } from "../layer_2/interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";

abstract contract Modifiers is LocalContext {
    // ===== ControlList Modifiers =====
    modifier onlyListedAllowed(address _account) virtual;

    // ===== KYC Modifiers =====
    modifier onlyValidDates(uint256 _validFrom, uint256 _validTo) virtual;
    modifier onlyValidKycStatus(IKyc.KycStatus _kycStatus, address _account) virtual;

    // ===== ProceedRecipients Modifiers =====
    modifier onlyIfProceedRecipient(address _proceedRecipient) virtual;
    modifier onlyIfNotProceedRecipient(address _proceedRecipient) virtual;

    // ===== ProtectedPartitions Modifiers =====
    modifier onlyProtectedPartitions() virtual;
    modifier onlyValidParticipant(bytes32 _partition) virtual;

    // ===== AccessControl Modifiers =====
    modifier onlyRole(bytes32 _role) virtual;
    modifier onlyRoleFor(bytes32 _role, address _account) virtual;
    modifier onlySameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) virtual;
    modifier onlyConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) virtual;

    // ===== KpiLinkedRate Modifiers =====
    modifier checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) virtual;
    modifier checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) virtual;

    // ===== ERC3643 Modifiers =====
    modifier onlyEmptyWallet(address _tokenHolder) virtual;
    modifier onlyUnrecoveredAddress(address _account) virtual;
    modifier onlyValidInputAmountsArrayLength(address[] memory _addresses, uint256[] memory _amounts) virtual;
    modifier onlyValidInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) virtual;

    // ===== Bond Modifiers =====
    modifier onlyAfterCurrentMaturityDate(uint256 _maturityDate) virtual;

    // ===== CorporateActions Modifiers =====
    modifier validateDates(uint256 _firstDate, uint256 _secondDate) virtual;
    modifier onlyMatchingActionType(bytes32 _actionType, uint256 _index) virtual;

    // ===== Pause Modifiers =====
    modifier onlyUnpaused() virtual;

    // ===== ERC1410 Modifiers =====
    modifier validateAddress(address account) virtual;
    modifier onlyDefaultPartitionWithSinglePartition(bytes32 partition) virtual;

    // ===== Common Modifiers =====
    modifier onlyUnProtectedPartitionsOrWildCardRole() virtual;
    modifier onlyClearingDisabled() virtual;
    modifier onlyUninitialized(bool _initialized) virtual;

    // ===== ScheduledTasks Modifiers =====
    modifier onlyValidTimestamp(uint256 _timestamp) virtual;
}
