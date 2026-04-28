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
import { ITransfer } from "../../facets/transfer/ITransfer.sol";
import { IAllowanceTypes } from "../../facets/allowance/IAllowanceTypes.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ClearingStorageWrapper } from "./ClearingStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";
import { KycStorageWrapper } from "../core/KycStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../core/AccessControlStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { IMint } from "../../facets/mint/IMint.sol";
import { IBurn } from "../../facets/burn/IBurn.sol";

/**
 * @notice Tracks whether token issuance is enabled and whether the module
 * has been initialised.
 * @param issuance When true, new tokens may be issued via the `issue` function.
 * @param initialized When true, the storage struct has been set to its default
 * operating state.
 * @author Asset Tokenization Studio Team
 */
struct ERC1594Storage {
    bool issuance;
    bool initialized;
}

/**
 * @title ERC1594StorageWrapper
 * @notice Library providing the core issuance, redemption, and compliance
 * checking logic for the ERC1594 token standard. Handles storage management,
 * balance mutations via ERC20/ERC1410 wrappers, and multi-layered access
 * controls (KYC, identity, compliance, control lists, allowances, partitions).
 * @dev All public functions revert with standard error selectors when
 * preconditions fail. Relies on EIP1066 status codes for categorisation.
 * Uses a diamond storage pattern anchored at `_ERC1594_STORAGE_POSITION`.
 * Internal and private helpers are designed for gas-efficient reusability
 * across transfer and redemption flows.
 */
library ERC1594StorageWrapper {
    using LowLevelCall for address;

    /**
     * @notice Initialises the ERC1594 storage to an active issuance state.
     * @dev Sets `issuance` to `true` and `initialized` to `true`. Must be
     * called exactly once before any issue operations.
     */
    function initialize() internal {
        ERC1594Storage storage ds = erc1594Storage();
        ds.issuance = true;
        ds.initialized = true;
    }

    /**
     * @notice Mints new tokens to a holder and emits an `Issued` event.
     * @dev Reverts if the caller is not `msg.sender` (the token contract
     * itself in a typical diamond layout). Uses `ERC20StorageWrapper.mint`
     * to modify the balance.
     * @param tokenHolder Address receiving the newly issued tokens.
     * @param value Amount of tokens to issue.
     */
    function issue(address tokenHolder, uint256 value) internal {
        ERC20StorageWrapper.mint(tokenHolder, value);
    }

    /**
     * @notice Burns tokens from `msg.sender` and emits a `Redeemed` event.
     * @dev The redeemer is both the sender and the token holder. Uses
     * `ERC20StorageWrapper.burn` to reduce the balance.
     * @param value Amount of tokens to redeem.
     */
    function redeem(uint256 value) internal {
        ERC20StorageWrapper.burn(EvmAccessors.getMsgSender(), value);
    }

    /**
     * @notice Burns tokens from a specified holder on behalf of `msg.sender`
     * using an existing allowance.
     * @dev Reverts if allowance is insufficient. Uses `ERC20StorageWrapper.burnFrom`.
     * @param tokenHolder Address whose tokens will be burned.
     * @param value Amount of tokens to redeem.
     */
    function redeemFrom(address tokenHolder, uint256 value) internal {
        ERC20StorageWrapper.burnFrom(tokenHolder, value);
    }

    /**
     * @notice Returns whether token issuance is currently enabled.
     * @return `true` if the `issuance` flag is set, otherwise `false`.
     */
    function isIssuable() internal view returns (bool) {
        return erc1594Storage().issuance;
    }

    /**
     * @notice Returns whether the ERC1594 storage has been initialised.
     * @return `true` if `initialize` has been called successfully.
     */
    function isERC1594Initialized() internal view returns (bool) {
        return erc1594Storage().initialized;
    }

    /**
     * @notice Reverts if a transfer from `from` to `to` of `value` in
     * `partition` is not allowed.
     * @dev Calls `checkCanTransferFromByPartition` with empty data and
     * operator data. Reverts with the appropriate reason code otherwise.
     * @param from Source address of the transfer.
     * @param to Destination address of the transfer.
     * @param partition Partition identifier for the transfer.
     * @param value Amount of tokens to transfer.
     */
    function requireCanTransferFromByPartition(
        address from,
        address to,
        bytes32 partition,
        uint256 value
    ) internal view {
        checkCanTransferFromByPartition(from, to, partition, value, EMPTY_BYTES, EMPTY_BYTES);
    }

    /**
     * @notice Reverts if a redemption from `from` in `partition` of `value`
     * is not allowed.
     * @dev Calls `checkCanRedeemFromByPartition` with empty data.
     * @param from Address whose tokens will be redeemed.
     * @param partition Partition identifier for the redemption.
     * @param value Amount of tokens to redeem.
     */
    function requireCanRedeemFromByPartition(address from, bytes32 partition, uint256 value) internal view {
        checkCanRedeemFromByPartition(from, partition, value, EMPTY_BYTES, EMPTY_BYTES);
    }

    /**
     * @notice Reverts if either `from` or `to` fails identity verification.
     * @dev Forwards to `checkIdentity`.
     * @param from Source address.
     * @param to Destination address.
     */
    function requireIdentified(address from, address to) internal view {
        checkIdentity(from, to);
    }

    /**
     * @notice Reverts if the transfer between `from` and `to` fails
     * compliance checks. Optionally checks sender compliance.
     * @dev Forwards to `checkCompliance`. Used when the sender is not
     * necessarily the `from` parameter.
     * @param from Source address.
     * @param to Destination address.
     * @param checkSender Whether to perform compliance validation on the
     * current `msg.sender`.
     */
    function requireCompliant(address from, address to, bool checkSender) internal view {
        checkCompliance(from, to, checkSender);
    }

    /**
     * @notice Reverts if either `from` or `to` is listed as a recovered
     * wallet.
     * @dev Reverts with `WalletRecovered` for any non-zero address whose
     * recovery flag is set in `ERC3643StorageWrapper`.
     * @param from Source address (may be zero).
     * @param to Destination address (may be zero).
     */
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
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
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

    /**
     * @notice Reverts if either `from` or `to` does not have a valid KYC
     * and identity verification.
     * @dev Calls `_isIdentified` and reverts with the encoded reason code
     * and details on failure.
     * @param from Source address (may be zero).
     * @param to Destination address (may be zero).
     */
    function checkIdentity(address from, address to) internal view {
        (bool isIdentified_, , bytes32 reasonCode, bytes memory details) = _isIdentified(from, to);
        if (!isIdentified_) LowLevelCall.revertWithData(bytes4(reasonCode), details);
    }

    /**
     * @notice Reverts if the transfer between `from` and `to` fails
     * compliance checks. Optionally checks sender compliance.
     * @dev Delegates to `_isCompliant` and reverts with the encoded reason
     * code and details on failure.
     * @param from Source address (may be zero).
     * @param to Destination address (may be zero).
     * @param checkSender Whether to validate compliance of `msg.sender`.
     */
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

    /**
     * @notice Returns the ERC1594 storage slot using the predefined
     * position constant.
     * @dev Uses inline assembly to retrieve the storage pointer.
     * @return ds Storage reference to the `ERC1594Storage` struct.
     */
    function erc1594Storage() internal pure returns (ERC1594Storage storage ds) {
        bytes32 position = _ERC1594_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    /**
     * @notice Performs system-wide checks that apply to all transfer and
     * redemption operations.
     * @dev Currently reverts if the clearing mechanism is activated.
     * @return status True if no system-level condition prevents the operation.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data (empty on success).
     */
    function _genericChecks() private view returns (bool, bytes1, bytes32, bytes memory) {
        if (ClearingStorageWrapper.isClearingActivated())
            return (false, Eip1066.UNAVAILABLE, IClearingTypes.ClearingIsActivated.selector, EMPTY_BYTES);
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    /**
     * @notice Determines whether the sender requires compliance and
     * allowance checks when acting on behalf of `_from` for a given
     * `_partition`.
     * @dev The sender needs checking if it is different from `_from` and
     * does not hold the protected partition role for that partition.
     * @param _from Token holder address.
     * @param _sender Address initiating the operation.
     * @param _partition Partition identifier.
     * @return checkSender_ True if the sender must pass additional checks.
     */
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

    /**
     * @notice Validates compliance for all parties involved in a transfer
     * or redemption.
     * @dev Checks the sender (if flagged), `from`, and `to` against
     * recovery, control list, and compliance contract. The compliance
     * contract is called via staticcall with `canTransfer`.
     * @param from Source address (may be zero).
     * @param to Destination address (may be zero).
     * @param value Transfer amount.
     * @param sender Address of the operator initiating the operation.
     * @param checkSender Whether to validate the sender's compliance.
     * @return status True if all compliance checks pass.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data (empty on success).
     */
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

    /**
     * @notice Validates that an individual account is not recovered and is
     * allowed by the control list.
     * @dev Reverts with `WalletRecovered` if the account is recovered, or
     * `AccountIsBlocked` if the control list denies access.
     * @param account Address to validate.
     * @param details Encoded data to include in the error payload on failure.
     * @return status True if the account passes both checks.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return outDetails Encoded error data.
     */
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

    /**
     * @notice Checks whether the sender (operator) is permitted to execute
     * the transfer according to the compliance contract.
     * @dev Performs a staticcall to the compliance contract's `canTransfer`
     * with `sender` as both `from` and `to`, and `value=0`. Reverts if the
     * call fails unexpectedly (i.e., not a boolean return).
     * @param sender Address of the operator.
     * @param from Source address of the transfer.
     * @param to Destination address of the transfer.
     * @param value Amount of tokens being transferred.
     * @return status True if the compliance contract does not forbid the operator.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data (includes `from`, `to`, `value` on failure).
     */
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

    /**
     * @notice Validates the transfer between `from` and `to` against the
     * compliance contract for the specified `value`.
     * @dev Calls the compliance contract's `canTransfer(from, to, value)`
     * via staticcall. Reverts with `ComplianceCallFailed` if the call fails
     * unexpectedly.
     * @param from Source address.
     * @param to Destination address.
     * @param value Amount of tokens to transfer.
     * @return status True if the compliance contract approves the transfer.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data (includes `from`, `to`, `value` on failure).
     */
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

    /**
     * @notice Validates that both `from` and `to` (when non-zero) have
     * a valid KYC status and are verified in the identity registry.
     * @dev Delegates to `_validateIdentifiedAccount` for each address.
     * @param from Source address (may be zero).
     * @param to Destination address (may be zero).
     * @return status True if all identity checks pass.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data.
     */
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

    /**
     * @notice Validates that an individual account has a GRANTED KYC status
     * and is verified by the identity registry.
     * @dev Uses `KycStorageWrapper.verifyKycStatus` and a staticcall to
     * the identity registry's `isVerified`. Reverts with
     * `IdentityRegistryCallFailed` if the staticcall fails unexpectedly.
     * @param account Address to validate.
     * @return status True if the account passes both identity checks.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data (includes `account` on failure).
     */
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

    /**
     * @notice Performs business logic checks after compliance and identity
     * validation: allowance (if required), partition validity, and
     * partition balance.
     * @param checkAllowance Whether to verify the sender's allowance for `from`.
     * @param from Token holder address.
     * @param value Amount of tokens to transfer/redeem.
     * @param partition Partition identifier.
     * @return isAbleToTransfer True if all business conditions are met.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data.
     */
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

    /**
     * @notice Checks whether the sender's allowance for `from` is
     * sufficient to cover `value`.
     * @dev Uses `ERC20StorageWrapper.allowanceAdjustedAt` with the current
     * block timestamp.
     * @param from Token holder address.
     * @param value Required allowance amount.
     * @return status True if allowance >= value.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data (sender, from, current allowance, value, default partition).
     */
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

    /**
     * @notice Validates that `partition` is a valid partition for `from`.
     * @dev Delegates to `ERC1410StorageWrapper.validPartition`.
     * @param from Token holder address.
     * @param partition Partition identifier.
     * @return status True if the partition is valid.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data (from, partition).
     */
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

    /**
     * @notice Checks whether `from` holds at least `value` tokens in the
     * specified `partition`.
     * @dev Uses `AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt`
     * with the current block timestamp.
     * @param from Token holder address.
     * @param value Amount of tokens required.
     * @param partition Partition identifier.
     * @return status True if the partition balance is sufficient.
     * @return statusCode EIP1066 status byte.
     * @return reasonCode Selector of the blocking error.
     * @return details Encoded error data (from, current balance, required value, partition).
     */
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
                ITransfer.InsufficientBalance.selector,
                abi.encode(from, currentPartitionBalance, value, partition)
            );
        }
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }
}
