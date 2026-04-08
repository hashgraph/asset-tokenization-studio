// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AddressValidation } from "../../infrastructure/utils/AddressValidation.sol";
import { ZeroAddressNotAllowed } from "../../infrastructure/errors/CommonErrors.sol";
import { ZERO_ADDRESS, EMPTY_BYTES, _DEFAULT_PARTITION } from "../../constants/values.sol";
import { _ERC1594_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKyc } from "../../facets/layer_1/kyc/IKyc.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { Eip1066 } from "../../constants/eip1066.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "../../facets/layer_1/ERC3643/IIdentityRegistry.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ClearingStorageWrapper } from "./ClearingStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";
import { IControlList } from "../../facets/layer_1/controlList/IControlList.sol";
import { KycStorageWrapper } from "../core/KycStorageWrapper.sol";

import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { _ACCESS_CONTROL_STORAGE_POSITION, RoleDataStorage } from "../core/AccessControlStorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { IERC1594 } from "../../facets/layer_1/ERC1400/ERC1594/IERC1594.sol";

struct ERC1594Storage {
    bool issuance;
    bool initialized;
}

library ERC1594StorageWrapper {
    using LowLevelCall for address;

    function initialize() internal {
        ERC1594Storage storage ds = erc1594Storage();
        ds.issuance = true;
        ds.initialized = true;
    }

    function issue(address tokenHolder, uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.mint(tokenHolder, value);
        emit IERC1594.Issued(EvmAccessors.getMsgSender(), tokenHolder, value, data);
    }

    function redeem(uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.burn(EvmAccessors.getMsgSender(), value);
        emit IERC1594.Redeemed(address(0), EvmAccessors.getMsgSender(), value, data);
    }

    function redeemFrom(address tokenHolder, uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.burnFrom(tokenHolder, value);
        emit IERC1594.Redeemed(EvmAccessors.getMsgSender(), tokenHolder, value, data);
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

    function requireNotRecoveredAddresses(address from, address to) internal view {
        if (from != address(0) && ERC3643StorageWrapper.isRecovered(from)) {
            revert IERC3643Types.WalletRecovered();
        }
        if (to != address(0) && ERC3643StorageWrapper.isRecovered(to)) {
            revert IERC3643Types.WalletRecovered();
        }
    }

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
        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _genericChecks();
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        // Format validation
        if (from == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                IControlList.AccountIsBlocked.selector,
                EMPTY_BYTES
            );
        }

        bool checkSender = from != EvmAccessors.getMsgSender() && !_checkSenderHasProtectedPartitionRole(partition);

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _isCompliant(from, address(0), value, checkSender);
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _isIdentified(from, address(0));
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        // Allowance check for the 'from' methods
        bool checkAllowance = checkSender &&
            !ERC1410StorageWrapper.isAuthorized(partition, EvmAccessors.getMsgSender(), from);

        return _businessLogicChecks(checkAllowance, from, value, partition);
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
        (isAbleToTransfer, statusCode, reasonCode, details) = _genericChecks();
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        // Format validation
        if (from == ZERO_ADDRESS || to == ZERO_ADDRESS) {
            return (false, Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE, ZeroAddressNotAllowed.selector, EMPTY_BYTES);
        }

        bool checkSender = from != EvmAccessors.getMsgSender() && !_checkSenderHasProtectedPartitionRole(partition);

        (isAbleToTransfer, statusCode, reasonCode, details) = _isCompliant(from, to, value, checkSender);
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        (isAbleToTransfer, statusCode, reasonCode, details) = _isIdentified(from, to);
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        // Allowance check for the 'from' methods
        bool checkAllowance = checkSender &&
            !ERC1410StorageWrapper.isAuthorized(partition, EvmAccessors.getMsgSender(), from);

        return _businessLogicChecks(checkAllowance, from, value, partition);
    }

    function checkIdentity(address from, address to) internal view {
        (bool isIdentified_, , bytes32 reasonCode, bytes memory details) = _isIdentified(from, to);
        if (!isIdentified_) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function checkCompliance(address from, address to, bool checkSender) internal view {
        (bool isCompliant_, , bytes32 reasonCode, bytes memory details) = _isCompliant(from, to, 0, checkSender);
        if (!isCompliant_) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function erc1594Storage() internal pure returns (ERC1594Storage storage ds) {
        bytes32 position = _ERC1594_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    function _genericChecks() private view returns (bool, bytes1, bytes32, bytes memory) {
        if (ClearingStorageWrapper.isClearingActivated()) {
            return (false, Eip1066.UNAVAILABLE, IClearingTypes.ClearingIsActivated.selector, EMPTY_BYTES);
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }
    function _checkSenderHasProtectedPartitionRole(bytes32 partition) private view returns (bool hasRole_) {
        bytes32 role = ProtectedPartitionsStorageWrapper.protectedPartitionsRole(partition);
        bytes32 position = _ACCESS_CONTROL_STORAGE_POSITION;
        RoleDataStorage storage roleDataStorage;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roleDataStorage.slot := position
        }
        hasRole_ = EnumerableSet.contains(roleDataStorage.roles[role].roleMembers, EvmAccessors.getMsgSender());
    }

    function _isCompliant(
        address from,
        address to,
        uint256 value,
        bool checkSender
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        // Check sender for blocked status and recovery status when required
        if (checkSender) {
            if (!ControlListStorageWrapper.isAbleToAccess(EvmAccessors.getMsgSender())) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IControlList.AccountIsBlocked.selector,
                    abi.encode(EvmAccessors.getMsgSender())
                );
            }
            if (ERC3643StorageWrapper.isRecovered(EvmAccessors.getMsgSender())) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643Types.WalletRecovered.selector,
                    abi.encode(EvmAccessors.getMsgSender())
                );
            }
            // Compliance check for sender in compliance module (amount is 0)
            bytes memory complianceResultSender = (ERC3643StorageWrapper.erc3643Storage().compliance)
                .functionStaticCall(
                    abi.encodeWithSelector(
                        ICompliance.canTransfer.selector,
                        EvmAccessors.getMsgSender(),
                        address(0),
                        0
                    ),
                    IERC3643Types.ComplianceCallFailed.selector
                );

            if (complianceResultSender.length > 0 && !abi.decode(complianceResultSender, (bool))) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IERC3643Types.ComplianceNotAllowed.selector,
                    abi.encode(from, to, value)
                );
            }
        }
        if (from != address(0)) {
            if (ERC3643StorageWrapper.isRecovered(from)) {
                return (false, Eip1066.REVOKED_OR_BANNED, IERC3643Types.WalletRecovered.selector, abi.encode(from));
            }

            if (!ControlListStorageWrapper.isAbleToAccess(from)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IControlList.AccountIsBlocked.selector, abi.encode(from));
            }
        }
        if (to != address(0)) {
            if (ERC3643StorageWrapper.isRecovered(to)) {
                return (false, Eip1066.REVOKED_OR_BANNED, IERC3643Types.WalletRecovered.selector, abi.encode(to));
            }

            if (!ControlListStorageWrapper.isAbleToAccess(to)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IControlList.AccountIsBlocked.selector, abi.encode(to));
            }
        }

        // Compliance module check
        bytes memory complianceResult = (ERC3643StorageWrapper.erc3643Storage().compliance).functionStaticCall(
            abi.encodeWithSelector(ICompliance.canTransfer.selector, from, to, value),
            IERC3643Types.ComplianceCallFailed.selector
        );

        if (complianceResult.length > 0 && !abi.decode(complianceResult, (bool))) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                IERC3643Types.ComplianceNotAllowed.selector,
                abi.encode(from, to, value)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _isIdentified(
        address from,
        address to
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (from != address(0)) {
            if (!KycStorageWrapper.verifyKycStatus(IKyc.KycStatus.GRANTED, from)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(from));
            }

            bytes memory isVerifiedFrom = (ERC3643StorageWrapper.erc3643Storage().identityRegistry).functionStaticCall(
                abi.encodeWithSelector(IIdentityRegistry.isVerified.selector, from),
                IERC3643Types.IdentityRegistryCallFailed.selector
            );

            if (isVerifiedFrom.length > 0 && !abi.decode(isVerifiedFrom, (bool))) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IERC3643Types.AddressNotVerified.selector, abi.encode(from));
            }
        }

        if (to != address(0)) {
            if (!KycStorageWrapper.verifyKycStatus(IKyc.KycStatus.GRANTED, to)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(to));
            }

            bytes memory isVerifiedTo = (ERC3643StorageWrapper.erc3643Storage().identityRegistry).functionStaticCall(
                abi.encodeWithSelector(IIdentityRegistry.isVerified.selector, to),
                IERC3643Types.IdentityRegistryCallFailed.selector
            );

            if (isVerifiedTo.length > 0 && !abi.decode(isVerifiedTo, (bool))) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IERC3643Types.AddressNotVerified.selector, abi.encode(to));
            }
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _businessLogicChecks(
        bool checkAllowance,
        address from,
        uint256 value,
        bytes32 partition
    ) private view returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (checkAllowance) {
            uint256 currentAllowance = ERC20StorageWrapper.allowanceAdjustedAt(
                from,
                EvmAccessors.getMsgSender(),
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
            if (currentAllowance < value) {
                return (
                    false,
                    Eip1066.INSUFFICIENT_FUNDS,
                    IERC20.InsufficientAllowance.selector,
                    abi.encode(EvmAccessors.getMsgSender(), from, currentAllowance, value, _DEFAULT_PARTITION)
                );
            }
        }

        // Partition validation check
        if (!ERC1410StorageWrapper.validPartition(partition, from)) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                IERC1410Types.InvalidPartition.selector,
                abi.encode(from, partition)
            );
        }

        // Balance check - check partition-specific balance
        uint256 currentPartitionBalance = AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(
            partition,
            from,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
        if (currentPartitionBalance < value) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                IERC20.InsufficientBalance.selector,
                abi.encode(from, currentPartitionBalance, value, partition)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }
}
