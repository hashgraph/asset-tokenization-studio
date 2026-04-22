// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";
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
import { IAllowanceTypes } from "../../facets/allowance/IAllowanceTypes.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ClearingStorageWrapper } from "./ClearingStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";
import { IControlList } from "../../facets/layer_1/controlList/IControlList.sol";
import { KycStorageWrapper } from "../core/KycStorageWrapper.sol";

import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../core/AccessControlStorageWrapper.sol";
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
        if (!isAbleToRedeemFrom) return (isAbleToRedeemFrom, statusCode, reasonCode, details);

        // Format validation
        if (from == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                ICommonErrors.AccountIsBlocked.selector,
                EMPTY_BYTES
            );
        }

        address sender = EvmAccessors.getMsgSender();
        bool checkSender = _checkSenderHasProtectedPartitionRole(from, sender, partition);

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _isCompliant(
            from,
            address(0),
            value,
            sender,
            checkSender
        );
        if (!isAbleToRedeemFrom) return (isAbleToRedeemFrom, statusCode, reasonCode, details);

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _isIdentified(from, address(0));
        if (!isAbleToRedeemFrom) return (isAbleToRedeemFrom, statusCode, reasonCode, details);

        // Allowance check for the 'from' methods
        bool checkAllowance = checkSender && !ERC1410StorageWrapper.isAuthorized(partition, sender, from);

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
        if (!isAbleToTransfer) LowLevelCall.revertWithData(bytes4(reasonCode), details);
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
        if (!isAbleToTransfer) return (isAbleToTransfer, statusCode, reasonCode, details);

        // Format validation
        if (from == ZERO_ADDRESS || to == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                ICommonErrors.ZeroAddressNotAllowed.selector,
                EMPTY_BYTES
            );
        }

        address sender = EvmAccessors.getMsgSender();
        bool checkSender = _checkSenderHasProtectedPartitionRole(from, sender, partition);

        (isAbleToTransfer, statusCode, reasonCode, details) = _isCompliant(from, to, value, sender, checkSender);
        if (!isAbleToTransfer) return (isAbleToTransfer, statusCode, reasonCode, details);

        (isAbleToTransfer, statusCode, reasonCode, details) = _isIdentified(from, to);
        if (!isAbleToTransfer) return (isAbleToTransfer, statusCode, reasonCode, details);

        // Allowance check for the 'from' methods
        bool checkAllowance = checkSender && !ERC1410StorageWrapper.isAuthorized(partition, sender, from);

        return _businessLogicChecks(checkAllowance, from, value, partition);
    }

    function checkIdentity(address from, address to) internal view {
        (bool isIdentified_, , bytes32 reasonCode, bytes memory details) = _isIdentified(from, to);
        if (!isIdentified_) LowLevelCall.revertWithData(bytes4(reasonCode), details);
    }

    function checkCompliance(address from, address to, bool checkSender) internal view {
        (bool isCompliant_, , bytes32 reasonCode, bytes memory details) = _isCompliant(
            from,
            to,
            0,
            EvmAccessors.getMsgSender(),
            checkSender
        );
        if (!isCompliant_) LowLevelCall.revertWithData(bytes4(reasonCode), details);
    }

    function erc1594Storage() internal pure returns (ERC1594Storage storage ds) {
        bytes32 position = _ERC1594_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    function _genericChecks() private view returns (bool, bytes1, bytes32, bytes memory) {
        if (ClearingStorageWrapper.isClearingActivated())
            return (false, Eip1066.UNAVAILABLE, IClearingTypes.ClearingIsActivated.selector, EMPTY_BYTES);
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _checkSenderHasProtectedPartitionRole(
        address _from,
        address _sender,
        bytes32 _partition
    ) private view returns (bool checkSender_) {
        checkSender_ =
            _from != _sender &&
            !AccessControlStorageWrapper.hasRole(
                ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition),
                _sender
            );
    }

    function _isCompliant(
        address from,
        address to,
        uint256 value,
        address sender,
        bool checkSender
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (checkSender) {
            (status, statusCode, reasonCode, details) = _validateAccountForTransfer(sender, abi.encode(sender));
            if (!status) return (status, statusCode, reasonCode, details);

            (status, statusCode, reasonCode, details) = _validateSenderCompliance(sender, from, to, value);
            if (!status) return (status, statusCode, reasonCode, details);
        }

        if (from != address(0)) {
            (status, statusCode, reasonCode, details) = _validateAccountForTransfer(from, abi.encode(from));
            if (!status) return (status, statusCode, reasonCode, details);
        }

        if (to != address(0)) {
            (status, statusCode, reasonCode, details) = _validateAccountForTransfer(to, abi.encode(to));
            if (!status) return (status, statusCode, reasonCode, details);
        }

        (status, statusCode, reasonCode, details) = _validateTransferCompliance(from, to, value);
        if (!status) return (status, statusCode, reasonCode, details);

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _validateAccountForTransfer(
        address account,
        bytes memory details
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory outDetails) {
        if (ERC3643StorageWrapper.isRecovered(account)) {
            return (false, Eip1066.REVOKED_OR_BANNED, IERC3643Types.WalletRecovered.selector, details);
        }

        if (!ControlListStorageWrapper.isAbleToAccess(account)) {
            return (false, Eip1066.DISALLOWED_OR_STOP, ICommonErrors.AccountIsBlocked.selector, details);
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _validateSenderCompliance(
        address sender,
        address from,
        address to,
        uint256 value
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        bytes memory result = ERC3643StorageWrapper.erc3643Storage().compliance.functionStaticCall(
            abi.encodeWithSelector(ICompliance.canTransfer.selector, sender, address(0), 0),
            IERC3643Types.ComplianceCallFailed.selector
        );

        if (result.length > 0 && !abi.decode(result, (bool))) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                IERC3643Types.ComplianceNotAllowed.selector,
                abi.encode(from, to, value)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _validateTransferCompliance(
        address from,
        address to,
        uint256 value
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        bytes memory result = ERC3643StorageWrapper.erc3643Storage().compliance.functionStaticCall(
            abi.encodeWithSelector(ICompliance.canTransfer.selector, from, to, value),
            IERC3643Types.ComplianceCallFailed.selector
        );

        if (result.length > 0 && !abi.decode(result, (bool))) {
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
            (status, statusCode, reasonCode, details) = _validateIdentifiedAccount(from);
            if (!status) return (status, statusCode, reasonCode, details);
        }

        if (to != address(0)) {
            (status, statusCode, reasonCode, details) = _validateIdentifiedAccount(to);
            if (!status) return (status, statusCode, reasonCode, details);
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _validateIdentifiedAccount(
        address account
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (!KycStorageWrapper.verifyKycStatus(IKyc.KycStatus.GRANTED, account)) {
            return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(account));
        }

        bytes memory isVerified = (ERC3643StorageWrapper.erc3643Storage().identityRegistry).functionStaticCall(
            abi.encodeWithSelector(IIdentityRegistry.isVerified.selector, account),
            IERC3643Types.IdentityRegistryCallFailed.selector
        );

        if (isVerified.length > 0 && !abi.decode(isVerified, (bool))) {
            return (false, Eip1066.DISALLOWED_OR_STOP, IERC3643Types.AddressNotVerified.selector, abi.encode(account));
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
            (isAbleToTransfer, statusCode, reasonCode, details) = _checkAllowance(from, value);
            if (!isAbleToTransfer) return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        (isAbleToTransfer, statusCode, reasonCode, details) = _checkPartitionValidity(from, partition);
        if (!isAbleToTransfer) return (isAbleToTransfer, statusCode, reasonCode, details);

        (isAbleToTransfer, statusCode, reasonCode, details) = _checkPartitionBalance(from, value, partition);
        if (!isAbleToTransfer) return (isAbleToTransfer, statusCode, reasonCode, details);

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _checkAllowance(address from, uint256 value) private view returns (bool, bytes1, bytes32, bytes memory) {
        address sender = EvmAccessors.getMsgSender();
        uint256 currentAllowance = ERC20StorageWrapper.allowanceAdjustedAt(
            from,
            sender,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        if (currentAllowance < value) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                IAllowanceTypes.InsufficientAllowance.selector,
                abi.encode(sender, from, currentAllowance, value, _DEFAULT_PARTITION)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _checkPartitionValidity(
        address from,
        bytes32 partition
    ) private view returns (bool, bytes1, bytes32, bytes memory) {
        if (!ERC1410StorageWrapper.validPartition(partition, from)) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                IERC1410Types.InvalidPartition.selector,
                abi.encode(from, partition)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _checkPartitionBalance(
        address from,
        uint256 value,
        bytes32 partition
    ) private view returns (bool, bytes1, bytes32, bytes memory) {
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
