// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AddressValidation } from "../../infrastructure/utils/AddressValidation.sol";
import { ZERO_ADDRESS, EMPTY_BYTES, _DEFAULT_PARTITION } from "../../constants/values.sol";
import { _ERC1594_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import { IERC1594StorageWrapper } from "./ERC1400/ERC1594/IERC1594StorageWrapper.sol";
import { Eip1066 } from "../../constants/eip1066.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { IERC3643Management } from "../../facets/layer_1/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "../../facets/layer_1/ERC3643/IIdentityRegistry.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { IERC1410StorageWrapper } from "./ERC1400/ERC1410/IERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ClearingStorageWrapper } from "./ClearingStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IControlListStorageWrapper } from "../core/controlList/IControlListStorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";
import { KycStorageWrapper } from "../core/KycStorageWrapper.sol";

import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { _ACCESS_CONTROL_STORAGE_POSITION, RoleDataStorage } from "../core/AccessControlStorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

struct ERC1594Storage {
    bool issuance;
    bool initialized;
}

library ERC1594StorageWrapper {
    using LowLevelCall for address;

    // --- External functions ---

    function initialize() internal {
        ERC1594Storage storage ds = erc1594Storage();
        ds.issuance = true;
        ds.initialized = true;
    }

    function issue(address tokenHolder, uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.mint(tokenHolder, value);
        emit IERC1594StorageWrapper.Issued(msg.sender, tokenHolder, value, data);
    }

    function redeem(uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.burn(msg.sender, value);
        emit IERC1594StorageWrapper.Redeemed(address(0), msg.sender, value, data);
    }

    function redeemFrom(address tokenHolder, uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.burnFrom(tokenHolder, value);
        emit IERC1594StorageWrapper.Redeemed(msg.sender, tokenHolder, value, data);
    }

    function isIssuable() internal view returns (bool) {
        return erc1594Storage().issuance;
    }

    function isERC1594Initialized() internal view returns (bool) {
        return erc1594Storage().initialized;
    }

    function requireCanTransferFromByPartition(
        address from,
        address to,
        bytes32 partition,
        uint256 value
    ) internal view {
        checkCanTransferFromByPartition(from, to, partition, value, EMPTY_BYTES, EMPTY_BYTES);
    }

    function requireCanRedeemFromByPartition(address from, bytes32 partition, uint256 value) internal view {
        checkCanRedeemFromByPartition(from, partition, value, EMPTY_BYTES, EMPTY_BYTES);
    }

    function requireIdentified(address from, address to) internal view {
        checkIdentity(from, to);
    }

    function requireCompliant(address from, address to, bool checkSender) internal view {
        checkCompliance(from, to, checkSender);
    }

    // --- Internal functions ---

    function checkCanRedeemFromByPartition(
        address from,
        bytes32 partition,
        uint256 value,
        bytes memory,
        bytes memory
    ) internal view {
        (bool isAbleToRedeemFrom, , bytes32 reasonCode, bytes memory details) = isAbleToRedeemFromByPartition(
            from,
            partition,
            value,
            EMPTY_BYTES,
            EMPTY_BYTES
        );
        if (!isAbleToRedeemFrom) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function isAbleToRedeemFromByPartition(
        address from,
        bytes32 partition,
        uint256 value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view returns (bool isAbleToRedeemFrom, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        (isAbleToRedeemFrom, statusCode, reasonCode, details) = genericChecks();
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        // Format validation
        if (from == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                IControlListStorageWrapper.AccountIsBlocked.selector,
                EMPTY_BYTES
            );
        }

        bool checkSender = from != msg.sender && !checkSenderHasProtectedPartitionRole(partition);

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = isCompliant(from, address(0), value, checkSender);
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = isIdentified(from, address(0));
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        // Allowance check for the 'from' methods
        bool checkAllowance = checkSender && !ERC1410StorageWrapper.isAuthorized(partition, msg.sender, from);

        return businessLogicChecks(checkAllowance, from, value, partition);
    }

    function checkCanTransferFromByPartition(
        address from,
        address to,
        bytes32 partition,
        uint256 value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view {
        (bool isAbleToTransfer, , bytes32 reasonCode, bytes memory details) = isAbleToTransferFromByPartition(
            from,
            to,
            partition,
            value,
            EMPTY_BYTES,
            EMPTY_BYTES
        );
        if (!isAbleToTransfer) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function isAbleToTransferFromByPartition(
        address from,
        address to,
        bytes32 partition,
        uint256 value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        (isAbleToTransfer, statusCode, reasonCode, details) = genericChecks();
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        // Format validation
        if (from == ZERO_ADDRESS || to == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                AddressValidation.ZeroAddressNotAllowed.selector,
                EMPTY_BYTES
            );
        }

        bool checkSender = from != msg.sender && !checkSenderHasProtectedPartitionRole(partition);

        (isAbleToTransfer, statusCode, reasonCode, details) = isCompliant(from, to, value, checkSender);
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        (isAbleToTransfer, statusCode, reasonCode, details) = isIdentified(from, to);
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        // Allowance check for the 'from' methods
        bool checkAllowance = checkSender && !ERC1410StorageWrapper.isAuthorized(partition, msg.sender, from);

        return businessLogicChecks(checkAllowance, from, value, partition);
    }

    function checkIdentity(address from, address to) internal view {
        (bool isIdentified, , bytes32 reasonCode, bytes memory details) = isIdentified(from, to);
        if (!isIdentified) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function checkCompliance(address from, address to, bool checkSender) internal view {
        (bool isCompliant, , bytes32 reasonCode, bytes memory details) = isCompliant(from, to, 0, checkSender);
        if (!isCompliant) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    // --- Internal Pure Functions ---

    function erc1594Storage() internal pure returns (ERC1594Storage storage ds) {
        bytes32 position = _ERC1594_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    // --- Private helper functions ---

    function genericChecks() private view returns (bool, bytes1, bytes32, bytes memory) {
        if (ClearingStorageWrapper.isClearingActivated()) {
            return (false, Eip1066.UNAVAILABLE, IClearing.ClearingIsActivated.selector, EMPTY_BYTES);
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }
    function checkSenderHasProtectedPartitionRole(bytes32 partition) private view returns (bool hasRole_) {
        bytes32 role = ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition);
        bytes32 position = _ACCESS_CONTROL_STORAGE_POSITION;
        RoleDataStorage storage roleDataStorage;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roleDataStorage.slot := position
        }
        hasRole_ = EnumerableSet.contains(roleDataStorage.roles[role].roleMembers, msg.sender);
    }

    function isCompliant(
        address from,
        address to,
        uint256 value,
        bool checkSender
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        // Check sender for blocked status and recovery status when required
        if (checkSender) {
            if (!ControlListStorageWrapper.isAbleToAccess(msg.sender)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IControlListStorageWrapper.AccountIsBlocked.selector,
                    abi.encode(msg.sender)
                );
            }
            if (ERC3643StorageWrapper.isRecovered(msg.sender)) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643Management.WalletRecovered.selector,
                    abi.encode(msg.sender)
                );
            }
            // Compliance check for sender in compliance module (amount is 0)
            bytes memory complianceResultSender = (ERC3643StorageWrapper.erc3643Storage().compliance)
                .functionStaticCall(
                    abi.encodeWithSelector(ICompliance.canTransfer.selector, msg.sender, address(0), 0),
                    IERC3643Management.ComplianceCallFailed.selector
                );

            if (complianceResultSender.length > 0 && !abi.decode(complianceResultSender, (bool))) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IERC3643Management.ComplianceNotAllowed.selector,
                    abi.encode(from, to, value)
                );
            }
        }
        if (from != address(0)) {
            if (ERC3643StorageWrapper.isRecovered(from)) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643Management.WalletRecovered.selector,
                    abi.encode(from)
                );
            }

            if (!ControlListStorageWrapper.isAbleToAccess(from)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IControlListStorageWrapper.AccountIsBlocked.selector,
                    abi.encode(from)
                );
            }
        }
        if (to != address(0)) {
            if (ERC3643StorageWrapper.isRecovered(to)) {
                return (false, Eip1066.REVOKED_OR_BANNED, IERC3643Management.WalletRecovered.selector, abi.encode(to));
            }

            if (!ControlListStorageWrapper.isAbleToAccess(to)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IControlListStorageWrapper.AccountIsBlocked.selector,
                    abi.encode(to)
                );
            }
        }

        // Compliance module check
        bytes memory complianceResult = (ERC3643StorageWrapper.erc3643Storage().compliance).functionStaticCall(
            abi.encodeWithSelector(ICompliance.canTransfer.selector, from, to, value),
            IERC3643Management.ComplianceCallFailed.selector
        );

        if (complianceResult.length > 0 && !abi.decode(complianceResult, (bool))) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                IERC3643Management.ComplianceNotAllowed.selector,
                abi.encode(from, to, value)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function isIdentified(
        address from,
        address to
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (from != address(0)) {
            if (!KycStorageWrapper.verifyKycStatus(IKyc.KycStatus.GRANTED, from)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(from));
            }

            bytes memory isVerifiedFrom = (ERC3643StorageWrapper.erc3643Storage().identityRegistry).functionStaticCall(
                abi.encodeWithSelector(IIdentityRegistry.isVerified.selector, from),
                IERC3643Management.IdentityRegistryCallFailed.selector
            );

            if (isVerifiedFrom.length > 0 && !abi.decode(isVerifiedFrom, (bool))) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IERC3643Management.AddressNotVerified.selector,
                    abi.encode(from)
                );
            }
        }

        if (to != address(0)) {
            if (!KycStorageWrapper.verifyKycStatus(IKyc.KycStatus.GRANTED, to)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(to));
            }

            bytes memory isVerifiedTo = (ERC3643StorageWrapper.erc3643Storage().identityRegistry).functionStaticCall(
                abi.encodeWithSelector(IIdentityRegistry.isVerified.selector, to),
                IERC3643Management.IdentityRegistryCallFailed.selector
            );

            if (isVerifiedTo.length > 0 && !abi.decode(isVerifiedTo, (bool))) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IERC3643Management.AddressNotVerified.selector,
                    abi.encode(to)
                );
            }
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function businessLogicChecks(
        bool checkAllowance,
        address from,
        uint256 value,
        bytes32 partition
    ) private view returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (checkAllowance) {
            uint256 currentAllowance = ERC20StorageWrapper.allowanceAdjustedAt(from, msg.sender, block.timestamp);
            if (currentAllowance < value) {
                return (
                    false,
                    Eip1066.INSUFFICIENT_FUNDS,
                    IERC1410StorageWrapper.InsufficientAllowance.selector,
                    abi.encode(msg.sender, from, currentAllowance, value, _DEFAULT_PARTITION)
                );
            }
        }

        // Partition validation check
        if (!ERC1410StorageWrapper.validPartition(partition, from)) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                IERC1410StorageWrapper.InvalidPartition.selector,
                abi.encode(from, partition)
            );
        }

        // Balance check - check partition-specific balance
        uint256 currentPartitionBalance = AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(
            partition,
            from,
            block.timestamp
        );
        if (currentPartitionBalance < value) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                IERC1410StorageWrapper.InsufficientBalance.selector,
                abi.encode(from, currentPartitionBalance, value, partition)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }
}
