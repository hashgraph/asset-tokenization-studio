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
import { IERC1594 } from "../../facets/layer_1/ERC1400/ERC1594/IERC1594.sol";

/**
 * @notice Diamond Storage struct for ERC1594 security token issuance state.
 * @dev    Stored at `_ERC1594_STORAGE_POSITION`. `issuance` is set to `true` on
 *         initialisation and is not mutated by this library; callers that wish to disable
 *         issuance must do so via higher-level facet logic. `initialized` guards against
 *         uninitialised state reads.
 * @param issuance     True if new token issuance is currently permitted.
 * @param initialized  True once `initialize` has been called.
 */
struct ERC1594Storage {
    bool issuance;
    bool initialized;
}

/**
 * @title  ERC1594StorageWrapper
 * @notice Internal library providing storage operations and transfer eligibility checks
 *         for ERC1594 security token issuance, redemption, and transfer validation.
 * @dev    Anchors `ERC1594Storage` at `_ERC1594_STORAGE_POSITION` following the ERC-2535
 *         Diamond Storage Pattern. All functions are `internal` and intended exclusively
 *         for use within facets or other internal libraries of the same diamond.
 *
 *         Transfer and redemption eligibility is evaluated through a layered validation
 *         pipeline executed in strict order:
 *           1. Generic checks — clearing activation guard.
 *           2. Address format validation — zero-address rejection.
 *           3. Compliance checks — control list, recovered wallet, and ERC3643
 *              `ICompliance.canTransfer` verification for sender, `from`, and `to`.
 *           4. Identity checks — KYC status and ERC3643 `IIdentityRegistry.isVerified`
 *              for each non-zero address.
 *           5. Business logic — allowance sufficiency (when applicable), partition
 *              validity, and partition balance sufficiency.
 *
 *         All eligibility functions return a four-element tuple:
 *         `(bool success, bytes1 EIP-1066 statusCode, bytes32 reasonCode, bytes details)`.
 *         Revert paths encode reason codes and details into a custom error selector and
 *         ABI-encoded payload via `LowLevelCall.revertWithData`.
 *
 *         The `checkSender` flag governs whether `msg.sender` is independently validated
 *         for compliance. It is `true` when the sender is distinct from `from` and does
 *         not hold the protected-partition role for the target partition, ensuring
 *         operator-initiated transfers are also subject to sender-level compliance.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 * @author Hashgraph
 */
library ERC1594StorageWrapper {
    using LowLevelCall for address;

    /**
     * @notice Initialises the ERC1594 subsystem, enabling issuance and marking the
     *         storage as initialised.
     * @dev    Sets both `issuance` and `initialized` to `true`. Calling this more than
     *         once will overwrite existing state; callers must enforce single-initialisation
     *         at the facet level. Does not emit an event.
     */
    function initialize() internal {
        ERC1594Storage storage ds = erc1594Storage();
        ds.issuance = true;
        ds.initialized = true;
    }

    /**
     * @notice Mints tokens to a recipient and emits `IERC1594.Issued`.
     * @dev    Delegates to `ERC20StorageWrapper.mint`, which internally invokes
     *         `ERC1410StorageWrapper.issueByPartition` under `_DEFAULT_PARTITION`.
     *         Callers are responsible for all eligibility checks before invoking this
     *         function. Does not verify `issuance` state; that guard must be applied at
     *         the facet level.
     *         Emits: `IERC1594.Issued`.
     * @param tokenHolder  Address to receive the newly issued tokens.
     * @param value        Token quantity to issue.
     * @param data         Arbitrary data associated with the issuance.
     */
    function issue(address tokenHolder, uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.mint(tokenHolder, value);
        emit IERC1594.Issued(EvmAccessors.getMsgSender(), tokenHolder, value, data);
    }

    /**
     * @notice Burns tokens from `msg.sender` and emits `IERC1594.Redeemed`.
     * @dev    Delegates to `ERC20StorageWrapper.burn`. The `from` parameter of the emitted
     *         event is `address(0)` to indicate a self-initiated redemption with no
     *         operator. Callers are responsible for eligibility checks before invocation.
     *         Emits: `IERC1594.Redeemed`.
     * @param value  Token quantity to redeem from `msg.sender`.
     * @param data   Arbitrary data associated with the redemption.
     */
    function redeem(uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.burn(EvmAccessors.getMsgSender(), value);
        emit IERC1594.Redeemed(address(0), EvmAccessors.getMsgSender(), value, data);
    }

    /**
     * @notice Burns tokens from `tokenHolder` on behalf of `msg.sender`, consuming the
     *         corresponding allowance, and emits `IERC1594.Redeemed`.
     * @dev    Delegates to `ERC20StorageWrapper.burnFrom`, which decrements the allowance
     *         granted by `tokenHolder` to `msg.sender`. Reverts with
     *         `IERC20.InsufficientAllowance` if the allowance is insufficient. Callers
     *         are responsible for eligibility checks before invocation.
     *         Emits: `IERC1594.Redeemed`.
     * @param tokenHolder  Address whose tokens are redeemed.
     * @param value        Token quantity to redeem.
     * @param data         Arbitrary data associated with the redemption.
     */
    function redeemFrom(address tokenHolder, uint256 value, bytes memory data) internal {
        ERC20StorageWrapper.burnFrom(tokenHolder, value);
        emit IERC1594.Redeemed(EvmAccessors.getMsgSender(), tokenHolder, value, data);
    }

    /**
     * @notice Returns whether new token issuance is currently permitted.
     * @dev    Reads `ERC1594Storage.issuance` directly. Returns `true` after
     *         `initialize` is called and until a facet-level operation disables it.
     * @return True if issuance is enabled; false otherwise.
     */
    function isIssuable() internal view returns (bool) {
        return erc1594Storage().issuance;
    }

    /**
     * @notice Returns whether the ERC1594 subsystem has been initialised.
     * @dev    Returns `false` until `initialize` has been called. A `false` return
     *         indicates that `issuance` state is uninitialised.
     * @return True if `initialize` has been called at least once; false otherwise.
     */
    function isERC1594Initialized() internal view returns (bool) {
        return erc1594Storage().initialized;
    }

    /**
     * @notice Reverts if `from` is not permitted to transfer `value` tokens from
     *         `partition` to `to`.
     * @dev    Convenience guard that delegates to `checkCanTransferFromByPartition` with
     *         empty `data` and `operatorData`. Reverts with the encoded reason code and
     *         details from the first failed validation step. Use as a pre-transfer guard
     *         in facets.
     * @param from       Source address to validate.
     * @param to         Destination address to validate.
     * @param partition  Partition under which the transfer would occur.
     * @param value      Token quantity to validate.
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
     * @notice Reverts if `from` is not permitted to redeem `value` tokens from
     *         `partition`.
     * @dev    Convenience guard that delegates to `checkCanRedeemFromByPartition` with
     *         empty `data` and `operatorData`. Reverts with the encoded reason code and
     *         details from the first failed validation step. Use as a pre-redemption guard
     *         in facets.
     * @param from       Address whose redemption eligibility is validated.
     * @param partition  Partition from which the tokens would be redeemed.
     * @param value      Token quantity to validate.
     */
    function requireCanRedeemFromByPartition(address from, bytes32 partition, uint256 value) internal view {
        checkCanRedeemFromByPartition(from, partition, value, EMPTY_BYTES, EMPTY_BYTES);
    }

    /**
     * @notice Reverts if either `from` or `to` fails identity verification.
     * @dev    Delegates to `checkIdentity`. Reverts with the encoded reason code and
     *         details for the first address that fails KYC status or identity registry
     *         verification. Addresses of `address(0)` are skipped.
     * @param from  Source address to verify; skipped if `address(0)`.
     * @param to    Destination address to verify; skipped if `address(0)`.
     */
    function requireIdentified(address from, address to) internal view {
        checkIdentity(from, to);
    }

    /**
     * @notice Reverts if any of `from`, `to`, or optionally `msg.sender` fails
     *         compliance validation.
     * @dev    Delegates to `checkCompliance`. When `checkSender` is `true`, `msg.sender`
     *         is independently validated for compliance before `from` and `to`. Reverts
     *         with the encoded reason code and details from the first failed check.
     * @param from         Source address to validate.
     * @param to           Destination address to validate; may be `address(0)`.
     * @param checkSender  True if `msg.sender` should also be validated for compliance.
     */
    function requireCompliant(address from, address to, bool checkSender) internal view {
        checkCompliance(from, to, checkSender);
    }

    /**
     * @notice Reverts if either `from` or `to` is a recovered wallet address.
     * @dev    Checks both addresses against `ERC3643StorageWrapper.isRecovered`.
     *         Addresses of `address(0)` are skipped. Reverts with
     *         `IERC3643Types.WalletRecovered` for the first recovered address found.
     * @param from  Address to check; skipped if `address(0)`.
     * @param to    Address to check; skipped if `address(0)`.
     */
    function requireNotRecoveredAddresses(address from, address to) internal view {
        if (from != address(0) && ERC3643StorageWrapper.isRecovered(from)) {
            revert IERC3643Types.WalletRecovered();
        }
        if (to != address(0) && ERC3643StorageWrapper.isRecovered(to)) {
            revert IERC3643Types.WalletRecovered();
        }
    }

    /**
     * @notice Reverts if `from` is not permitted to redeem `value` tokens from
     *         `partition`, encoding the reason from the first failed validation step.
     * @dev    Calls `isAbleToRedeemFromByPartition` and reverts via
     *         `LowLevelCall.revertWithData` if the result is `false`. The `data` and
     *         `operatorData` parameters are accepted for interface compatibility but are
     *         unused in the current validation logic.
     * @param from       Address whose redemption eligibility is evaluated.
     * @param partition  Partition from which the tokens would be redeemed.
     * @param value      Token quantity to validate.
     */
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

    /**
     * @notice Returns the full eligibility result for a partition redemption, evaluating
     *         clearing state, address validity, compliance, identity, and balance
     *         sufficiency in order.
     * @dev    Executes the five-stage validation pipeline for redemption:
     *           1. Generic checks — returns failure if clearing is active.
     *           2. Zero-address rejection for `from`.
     *           3. Compliance — validates `from` and optionally `msg.sender` via
     *              ERC3643 `ICompliance.canTransfer`.
     *           4. Identity — validates `from` via KYC and identity registry.
     *           5. Business logic — allowance check (if `checkSender` and not an
     *              authorised operator), partition validity, and partition balance.
     *         `checkSender` is `true` when `msg.sender != from` and the sender does not
     *         hold the protected-partition role for `partition`. The `_data` and
     *         `_operatorData` parameters are accepted for interface compatibility but are
     *         unused.
     * @param from       Address attempting the redemption.
     * @param partition  Partition from which tokens would be redeemed.
     * @param value      Token quantity to redeem.
     * @return isAbleToRedeemFrom  True if all validation stages pass.
     * @return statusCode          EIP-1066 status byte for the result.
     * @return reasonCode          Error selector of the first failed check; `bytes32(0)`
     *                             on success.
     * @return details             ABI-encoded context for the failure; empty on success.
     */
    function isAbleToRedeemFromByPartition(
        address from,
        bytes32 partition,
        uint256 value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view returns (bool isAbleToRedeemFrom, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _genericChecks();
        if (!isAbleToRedeemFrom) return (isAbleToRedeemFrom, statusCode, reasonCode, details);
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
        bool checkAllowance = checkSender && !ERC1410StorageWrapper.isAuthorized(partition, sender, from);
        return _businessLogicChecks(checkAllowance, from, value, partition);
    }

    /**
     * @notice Reverts if the proposed transfer from `from` to `to` of `value` tokens
     *         under `partition` fails any validation stage.
     * @dev    Calls `isAbleToTransferFromByPartition` and reverts via
     *         `LowLevelCall.revertWithData` if the result is `false`. The `data` and
     *         `operatorData` parameters are accepted for interface compatibility but are
     *         unused.
     * @param from       Source address to validate.
     * @param to         Destination address to validate.
     * @param partition  Partition under which the transfer would occur.
     * @param value      Token quantity to validate.
     */
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

    /**
     * @notice Returns the full eligibility result for a partition transfer, evaluating
     *         clearing state, address validity, compliance, identity, and balance
     *         sufficiency in order.
     * @dev    Executes the five-stage validation pipeline for transfers:
     *           1. Generic checks — returns failure if clearing is active.
     *           2. Zero-address rejection for both `from` and `to`.
     *           3. Compliance — validates `from`, `to`, and optionally `msg.sender` via
     *              ERC3643 `ICompliance.canTransfer`.
     *           4. Identity — validates `from` and `to` via KYC and identity registry.
     *           5. Business logic — allowance check (if `checkSender` and not an
     *              authorised operator), partition validity, and partition balance.
     *         `checkSender` is `true` when `msg.sender != from` and the sender does not
     *         hold the protected-partition role for `partition`. The `_data` and
     *         `_operatorData` parameters are accepted for interface compatibility but
     *         are unused.
     * @param from       Source address to validate.
     * @param to         Destination address to validate.
     * @param partition  Partition under which the transfer would occur.
     * @param value      Token quantity to validate.
     * @return isAbleToTransfer  True if all validation stages pass.
     * @return statusCode        EIP-1066 status byte for the result.
     * @return reasonCode        Error selector of the first failed check; `bytes32(0)`
     *                           on success.
     * @return details           ABI-encoded context for the failure; empty on success.
     */
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
        bool checkAllowance = checkSender && !ERC1410StorageWrapper.isAuthorized(partition, sender, from);
        return _businessLogicChecks(checkAllowance, from, value, partition);
    }

    /**
     * @notice Reverts if either `from` or `to` fails KYC status or identity registry
     *         verification.
     * @dev    Calls `_isIdentified` and reverts via `LowLevelCall.revertWithData` on
     *         failure. Addresses of `address(0)` are skipped. The reason code will be
     *         `IKyc.InvalidKycStatus` or `IERC3643Types.AddressNotVerified` depending on
     *         which check fails first.
     * @param from  Source address to verify; skipped if `address(0)`.
     * @param to    Destination address to verify; skipped if `address(0)`.
     */
    function checkIdentity(address from, address to) internal view {
        (bool isIdentified_, , bytes32 reasonCode, bytes memory details) = _isIdentified(from, to);
        if (!isIdentified_) LowLevelCall.revertWithData(bytes4(reasonCode), details);
    }

    /**
     * @notice Reverts if any of `from`, `to`, or optionally `msg.sender` fails
     *         compliance validation.
     * @dev    Calls `_isCompliant` with `value = 0` and reverts via
     *         `LowLevelCall.revertWithData` on failure. When `checkSender` is `true`,
     *         `msg.sender` is the first address evaluated. The reason code will be
     *         `ICommonErrors.AccountIsBlocked`, `IERC3643Types.WalletRecovered`, or
     *         `IERC3643Types.ComplianceNotAllowed` depending on which check fails first.
     * @param from         Source address to validate.
     * @param to           Destination address to validate; may be `address(0)`.
     * @param checkSender  True if `msg.sender` should also be validated for compliance.
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
     * @notice Evaluates the pre-condition that clearing is not active.
     * @dev    Returns a failure result if `ClearingStorageWrapper.isClearingActivated`
     *         is `true`, encoding `IClearingTypes.ClearingIsActivated` as the reason.
     *         This is the first check in all transfer and redemption validation pipelines.
     * @return True and `SUCCESS` status if clearing is inactive; failure result otherwise.
     */
    function _genericChecks() private view returns (bool, bytes1, bytes32, bytes memory) {
        if (ClearingStorageWrapper.isClearingActivated())
            return (false, Eip1066.UNAVAILABLE, IClearingTypes.ClearingIsActivated.selector, EMPTY_BYTES);
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    /**
     * @notice Determines whether `msg.sender` must be independently validated for
     *         compliance by checking whether the sender is the token holder or holds the
     *         protected-partition role for the target partition.
     * @dev    Returns `true` (i.e. sender must be checked) when `_from != _sender` AND
     *         `_sender` does not hold the protected-partition role for `_partition` as
     *         determined by `ProtectedPartitionsStorageWrapper` and
     *         `AccessControlStorageWrapper`. A `false` return means the sender is either
     *         the token holder or a privileged operator exempt from sender-level
     *         compliance checks.
     * @param _from       Token holder address.
     * @param _sender     Address of `msg.sender`.
     * @param _partition  Partition under which the operation is being evaluated.
     * @return checkSender_  True if the sender must be independently compliance-checked.
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
     * @notice Evaluates the full compliance chain for a transfer, validating each
     *         non-zero address against the control list and recovered-wallet registry,
     *         and querying `ICompliance.canTransfer` for both sender-level and
     *         transfer-level checks.
     * @dev    Validation order when `checkSender` is `true`:
     *           1. `sender` — account-level validation then `canTransfer(sender, 0x0, 0)`.
     *           2. `from`   — account-level validation (if non-zero).
     *           3. `to`     — account-level validation (if non-zero).
     *           4. Transfer-level `canTransfer(from, to, value)`.
     *         When `checkSender` is `false`, step 1 is skipped. Account-level validation
     *         checks recovered status and control list eligibility. Both compliance calls
     *         use `functionStaticCall` and revert with
     *         `IERC3643Types.ComplianceCallFailed` if the static call fails.
     * @param from         Source address; skipped at account level if `address(0)`.
     * @param to           Destination address; skipped at account level if `address(0)`.
     * @param value        Token quantity used in the transfer-level compliance query.
     * @param sender       Address of `msg.sender` used for sender-level compliance.
     * @param checkSender  True if `sender` should be independently compliance-checked.
     * @return status      True if all compliance checks pass.
     * @return statusCode  EIP-1066 status byte.
     * @return reasonCode  Error selector of the first failed check; `bytes32(0)` on
     *                     success.
     * @return details     ABI-encoded context for the failure; empty on success.
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
     * @notice Validates a single account against the recovered-wallet registry and the
     *         control list access policy.
     * @dev    Returns `REVOKED_OR_BANNED` with `IERC3643Types.WalletRecovered` if the
     *         account is recovered. Returns `DISALLOWED_OR_STOP` with
     *         `ICommonErrors.AccountIsBlocked` if the account fails the control list
     *         check. The `details` parameter is passed through as the encoded failure
     *         context for caller use.
     * @param account   Address to validate.
     * @param details   Caller-provided context to include in the failure result.
     * @return status      True if the account passes both checks.
     * @return statusCode  EIP-1066 status byte.
     * @return reasonCode  Error selector of the first failed check; `bytes32(0)` on
     *                     success.
     * @return outDetails  `details` on failure; empty on success.
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
     * @notice Queries `ICompliance.canTransfer` for `msg.sender` as the operator,
     *         validating that the sender is itself permitted to initiate transfers.
     * @dev    Calls `canTransfer(sender, address(0), 0)` via static call. Returns
     *         `DISALLOWED_OR_STOP` with `IERC3643Types.ComplianceNotAllowed` and
     *         ABI-encoded `(from, to, value)` if the compliance module rejects the
     *         sender. Reverts with `IERC3643Types.ComplianceCallFailed` if the static
     *         call itself fails.
     * @param sender  `msg.sender` address being evaluated as the initiating operator.
     * @param from    Source address included in the failure details for context.
     * @param to      Destination address included in the failure details for context.
     * @param value   Transfer amount included in the failure details for context.
     * @return status      True if the compliance module permits the sender.
     * @return statusCode  EIP-1066 status byte.
     * @return reasonCode  Error selector on failure; `bytes32(0)` on success.
     * @return details     ABI-encoded `(from, to, value)` on failure; empty on success.
     */
    function _validateSenderCompliance(
        address sender,
        address from,
        address to,
        uint256 value
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        bytes memory result = ERC3643StorageWrapper.getCompliance().functionStaticCall(
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
     * @notice Queries `ICompliance.canTransfer` for the `(from, to, value)` pair,
     *         validating that the transfer itself is permitted by the compliance module.
     * @dev    Calls `canTransfer(from, to, value)` via static call. Returns
     *         `DISALLOWED_OR_STOP` with `IERC3643Types.ComplianceNotAllowed` and
     *         ABI-encoded `(from, to, value)` if the module rejects. Reverts with
     *         `IERC3643Types.ComplianceCallFailed` if the static call fails.
     * @param from   Source address for the compliance query.
     * @param to     Destination address for the compliance query.
     * @param value  Token quantity for the compliance query.
     * @return status      True if the compliance module permits the transfer.
     * @return statusCode  EIP-1066 status byte.
     * @return reasonCode  Error selector on failure; `bytes32(0)` on success.
     * @return details     ABI-encoded `(from, to, value)` on failure; empty on success.
     */
    function _validateTransferCompliance(
        address from,
        address to,
        uint256 value
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        bytes memory result = ERC3643StorageWrapper.getCompliance().functionStaticCall(
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
     * @notice Evaluates KYC status and ERC3643 identity registry verification for both
     *         `from` and `to`, skipping any `address(0)` inputs.
     * @dev    Validates `from` first, then `to`. Each address must have
     *         `IKyc.KycStatus.GRANTED` and return `true` from
     *         `IIdentityRegistry.isVerified`. Returns `DISALLOWED_OR_STOP` with
     *         `IKyc.InvalidKycStatus` or `IERC3643Types.AddressNotVerified` respectively
     *         on failure. Reverts with `IERC3643Types.IdentityRegistryCallFailed` if the
     *         registry static call itself fails.
     * @param from  Address to verify; skipped if `address(0)`.
     * @param to    Address to verify; skipped if `address(0)`.
     * @return status      True if all non-zero addresses pass identity checks.
     * @return statusCode  EIP-1066 status byte.
     * @return reasonCode  Error selector of the first failed check; `bytes32(0)` on
     *                     success.
     * @return details     ABI-encoded failing address on failure; empty on success.
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
     * @notice Validates a single account's KYC status and ERC3643 identity registry
     *         verification.
     * @dev    Checks `IKyc.KycStatus.GRANTED` via `KycStorageWrapper.verifyKycStatus`
     *         first, then calls `IIdentityRegistry.isVerified` via static call. Returns
     *         `DISALLOWED_OR_STOP` with `IKyc.InvalidKycStatus` if KYC fails, or
     *         `IERC3643Types.AddressNotVerified` if the registry rejects the account.
     *         Reverts with `IERC3643Types.IdentityRegistryCallFailed` if the static call
     *         itself fails.
     * @param account  Address to validate.
     * @return status      True if the account passes both KYC and identity checks.
     * @return statusCode  EIP-1066 status byte.
     * @return reasonCode  Error selector on failure; `bytes32(0)` on success.
     * @return details     ABI-encoded `account` on failure; empty on success.
     */
    function _validateIdentifiedAccount(
        address account
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (!KycStorageWrapper.verifyKycStatus(IKyc.KycStatus.GRANTED, account)) {
            return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(account));
        }
        bytes memory isVerified = ERC3643StorageWrapper.getIdentityRegistry().functionStaticCall(
            abi.encodeWithSelector(IIdentityRegistry.isVerified.selector, account),
            IERC3643Types.IdentityRegistryCallFailed.selector
        );
        if (isVerified.length > 0 && !abi.decode(isVerified, (bool))) {
            return (false, Eip1066.DISALLOWED_OR_STOP, IERC3643Types.AddressNotVerified.selector, abi.encode(account));
        }
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    /**
     * @notice Evaluates allowance sufficiency, partition validity, and partition balance
     *         adequacy as the final stage of the transfer and redemption validation
     *         pipeline.
     * @dev    Checks are applied in order and return on the first failure:
     *           1. Allowance — only when `checkAllowance` is `true`; reads the ABAF-
     *              adjusted allowance at the current block timestamp.
     *           2. Partition validity — confirms `from` holds a position in `partition`.
     *           3. Partition balance — reads the ABAF-adjusted partition balance at the
     *              current block timestamp and compares against `value`.
     *         Returns `INSUFFICIENT_FUNDS` with the appropriate error selector and
     *         ABI-encoded context on each failure.
     * @param checkAllowance  True if the sender's allowance must be verified.
     * @param from            Address whose partition balance and allowance are checked.
     * @param value           Token quantity required.
     * @param partition       Partition under which the operation would occur.
     * @return isAbleToTransfer  True if all business logic checks pass.
     * @return statusCode        EIP-1066 status byte.
     * @return reasonCode        Error selector of the first failed check; `bytes32(0)`
     *                           on success.
     * @return details           ABI-encoded context for the failure; empty on success.
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
     * @notice Verifies that `msg.sender`'s ABAF-adjusted allowance from `from` is
     *         sufficient to cover `value`.
     * @dev    Reads the allowance via `ERC20StorageWrapper.allowanceAdjustedAt` at the
     *         current block timestamp. Returns `INSUFFICIENT_FUNDS` with
     *         `IERC20.InsufficientAllowance` and ABI-encoded
     *         `(sender, from, currentAllowance, value, _DEFAULT_PARTITION)` if the
     *         allowance is insufficient.
     * @param from   Address that granted the allowance.
     * @param value  Token quantity that the allowance must cover.
     * @return True and success fields if the allowance is sufficient; failure result
     *         otherwise.
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
                IERC20.InsufficientAllowance.selector,
                abi.encode(sender, from, currentAllowance, value, _DEFAULT_PARTITION)
            );
        }
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    /**
     * @notice Verifies that `from` holds an existing position in `partition`.
     * @dev    Delegates to `ERC1410StorageWrapper.validPartition`. Returns
     *         `INSUFFICIENT_FUNDS` with `IERC1410Types.InvalidPartition` and ABI-encoded
     *         `(from, partition)` if no position exists.
     * @param from       Address to check.
     * @param partition  Partition identifier to validate against.
     * @return True and success fields if the partition is valid; failure result otherwise.
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
     * @notice Verifies that `from`'s ABAF-adjusted partition balance is sufficient to
     *         cover `value`.
     * @dev    Reads the balance via
     *         `AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt` at the
     *         current block timestamp. Returns `INSUFFICIENT_FUNDS` with
     *         `IERC20.InsufficientBalance` and ABI-encoded
     *         `(from, currentPartitionBalance, value, partition)` if insufficient.
     * @param from       Address to check.
     * @param value      Token quantity required.
     * @param partition  Partition under which the balance is evaluated.
     * @return True and success fields if the balance is sufficient; failure result
     *         otherwise.
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
                IERC20.InsufficientBalance.selector,
                abi.encode(from, currentPartitionBalance, value, partition)
            );
        }
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    /**
     * @notice Returns the Diamond Storage pointer for `ERC1594Storage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_ERC1594_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Must only be called from within this library.
     * @return ds  Storage pointer to the `ERC1594Storage` struct.
     */
    function erc1594Storage() private pure returns (ERC1594Storage storage ds) {
        bytes32 position = _ERC1594_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
