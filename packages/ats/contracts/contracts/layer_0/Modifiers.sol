// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LocalContext } from "./context/LocalContext.sol";
import { IKyc } from "../layer_1/interfaces/kyc/IKyc.sol";
import { IKpiLinkedRate } from "../layer_2/interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
import { IClearing } from "../layer_1/interfaces/clearing/IClearing.sol";
import { HoldIdentifier } from "../layer_1/interfaces/hold/IHold.sol";

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
    modifier onlyPaused() virtual;

    // ===== ERC1410 Modifiers =====
    modifier validateAddress(address account) virtual;
    modifier onlyDefaultPartitionWithSinglePartition(bytes32 partition) virtual;

    // ===== Common Modifiers =====
    modifier onlyUnProtectedPartitionsOrWildCardRole() virtual;
    modifier onlyClearingDisabled() virtual;
    modifier onlyUninitialized(bool _initialized) virtual;

    // ===== ScheduledTasks Modifiers =====
    modifier onlyValidTimestamp(uint256 _timestamp) virtual;

    // ===== Cap Modifiers =====
    modifier onlyValidNewMaxSupply(uint256 _newMaxSupply) virtual;
    modifier onlyValidNewMaxSupplyByPartition(bytes32 _partition, uint256 _newMaxSupply) virtual;
    modifier onlyWithinMaxSupply(uint256 _amount) virtual;
    modifier onlyWithinMaxSupplyByPartition(bytes32 _partition, uint256 _amount) virtual;

    modifier onlyWithValidExpirationTimestamp(uint256 _expirationTimestamp) virtual;
    modifier onlyClearingActivated() virtual;
    modifier onlyWithValidClearingId(IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier)
        virtual;
    modifier validateExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) virtual;

    // ===== ERC1594 Modifiers =====
    modifier onlyIdentified(address _from, address _to) virtual;
    modifier onlyCompliant(address _from, address _to, bool _checkSender) virtual;
    modifier onlyCanTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory,
        bytes memory
    ) virtual;
    modifier onlyCanRedeemFromByPartition(address _from, bytes32 _partition, uint256 _value, bytes memory, bytes memory)
        virtual;
    modifier onlyWithoutMultiPartition() virtual;

    // ===== ERC1644 Modifiers =====
    modifier onlyControllable() virtual;

    // ===== SSI Modifiers =====
    modifier onlyIssuerListed(address _issuer) virtual;

    // ===== ERC1410 Operator Modifiers =====
    modifier onlyOperator(bytes32 _partition, address _from) virtual;

    // ===== Lock Modifiers =====
    modifier onlyWithLockedExpirationTimestamp(bytes32 _partition, address _tokenHolder, uint256 _lockId) virtual;
    modifier onlyWithValidLockId(bytes32 _partition, address _tokenHolder, uint256 _lockId) virtual;

    // ===== Hold Modifiers =====
    modifier onlyWithValidHoldId(HoldIdentifier calldata _holdIdentifier) virtual;

    // ===== AdjustBalances Modifiers =====
    modifier validateFactor(uint256 _factor) virtual;
}
