// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ZERO_ADDRESS, EMPTY_BYTES, _DEFAULT_PARTITION } from "../../constants/values.sol";
import { ERC1594Storage, erc1594Storage } from "../../storage/TokenStorage.sol";
import { erc20Storage } from "../../storage/TokenStorage.sol";
import { erc3643Storage } from "../../storage/ExternalStorage.sol";
import { IKyc } from "../../facets/features/interfaces/kyc/IKyc.sol";
import { IPauseStorageWrapper } from "../../facets/features/interfaces/pause/IPauseStorageWrapper.sol";
import { IERC1410StorageWrapper } from "../../facets/features/interfaces/ERC1400/IERC1410StorageWrapper.sol";
import { IERC20StorageWrapper } from "../../facets/features/interfaces/ERC1400/IERC20StorageWrapper.sol";
import {
    IControlListStorageWrapper
} from "../../facets/features/interfaces/controlList/IControlListStorageWrapper.sol";
import { Eip1066 } from "../../constants/eip1066.sol";
import { IClearing } from "../../facets/features/interfaces/clearing/IClearing.sol";
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/features/interfaces/ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "../../facets/features/interfaces/ERC3643/IIdentityRegistry.sol";
import { LibLowLevelCall } from "../../infrastructure/lib/LibLowLevelCall.sol";
import { LibPause } from "../core/LibPause.sol";
import { LibAccess } from "../core/LibAccess.sol";
import { LibControlList } from "../core/LibControlList.sol";
import { LibCompliance } from "../core/LibCompliance.sol";
import { LibKyc } from "../core/LibKyc.sol";
import { LibProtectedPartitions } from "../core/LibProtectedPartitions.sol";
import { LibABAF } from "./LibABAF.sol";
import { LibERC1410 } from "./LibERC1410.sol";
import { LibClearing } from "./LibClearing.sol";

/// @title LibERC1594
/// @notice Library for ERC1594 issuance/redemption feature management and transfer validation
/// @dev Extracted from ERC1594StorageWrapper for library-based diamond migration
library LibERC1594 {
    using LibLowLevelCall for address;

    error NotIssuable();

    // ═══════════════════════════════════════════════════════════════════════════════
    // ISSUANCE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    function initialize(bool _isIssuable) internal {
        ERC1594Storage storage s = erc1594Storage();
        s.issuance = _isIssuable;
        s.initialized = true;
    }

    function setIssuable(bool _issuable) internal {
        erc1594Storage().issuance = _issuable;
    }

    function isIssuable() internal view returns (bool) {
        return erc1594Storage().issuance;
    }

    function isInitialized() internal view returns (bool) {
        return erc1594Storage().initialized;
    }

    function checkIssuable() internal view {
        if (!isIssuable()) revert NotIssuable();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRANSFER/REDEEM VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════════

    function isAbleToTransferFromByPartition(
        address _sender,
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        uint256 _timestamp
    ) internal view returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        (isAbleToTransfer, statusCode, reasonCode, details) = _genericChecks();
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        if (_from == ZERO_ADDRESS || _to == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                LibERC1410.ZeroAddressNotAllowed.selector,
                EMPTY_BYTES
            );
        }

        bool checkSender = _from != _sender &&
            !LibAccess.hasRole(LibProtectedPartitions.protectedPartitionsRole(_partition), _sender);

        (isAbleToTransfer, statusCode, reasonCode, details) = _isCompliant(_sender, _from, _to, _value, checkSender);
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        (isAbleToTransfer, statusCode, reasonCode, details) = _isIdentified(_from, _to);
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        bool checkAllowance = checkSender && !LibERC1410.isAuthorized(_partition, _sender, _from);

        return _businessLogicChecks(checkAllowance, _sender, _from, _value, _partition, _timestamp);
    }

    function isAbleToRedeemFromByPartition(
        address _sender,
        address _from,
        bytes32 _partition,
        uint256 _value,
        uint256 _timestamp
    ) internal view returns (bool isAbleToRedeemFrom, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _genericChecks();
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        if (_from == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                IControlListStorageWrapper.AccountIsBlocked.selector,
                EMPTY_BYTES
            );
        }

        bool checkSender = _from != _sender &&
            !LibAccess.hasRole(LibProtectedPartitions.protectedPartitionsRole(_partition), _sender);

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _isCompliant(
            _sender,
            _from,
            address(0),
            _value,
            checkSender
        );
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _isIdentified(_from, address(0));
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        bool checkAllowance = checkSender && !LibERC1410.isAuthorized(_partition, _sender, _from);

        return _businessLogicChecks(checkAllowance, _sender, _from, _value, _partition, _timestamp);
    }

    function checkCanTransferFromByPartition(
        address _sender,
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        uint256 _timestamp
    ) internal view {
        (bool isAbleToTransfer, , bytes32 reasonCode, bytes memory details) = isAbleToTransferFromByPartition(
            _sender,
            _from,
            _to,
            _partition,
            _value,
            _timestamp
        );
        if (!isAbleToTransfer) {
            LibLowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function checkCanRedeemFromByPartition(
        address _sender,
        address _from,
        bytes32 _partition,
        uint256 _value,
        uint256 _timestamp
    ) internal view {
        (bool isAbleToRedeemFrom, , bytes32 reasonCode, bytes memory details) = isAbleToRedeemFromByPartition(
            _sender,
            _from,
            _partition,
            _value,
            _timestamp
        );
        if (!isAbleToRedeemFrom) {
            LibLowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function checkIdentity(address _from, address _to) internal view {
        (bool isIdentified, , bytes32 reasonCode, bytes memory details) = _isIdentified(_from, _to);
        if (!isIdentified) {
            LibLowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function checkCompliance(address _sender, address _from, address _to, bool _checkSender) internal view {
        (bool isCompliant, , bytes32 reasonCode, bytes memory details) = _isCompliant(
            _sender,
            _from,
            _to,
            0,
            _checkSender
        );
        if (!isCompliant) {
            LibLowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _genericChecks() private view returns (bool, bytes1, bytes32, bytes memory) {
        if (LibPause.isPaused()) {
            return (false, Eip1066.PAUSED, IPauseStorageWrapper.TokenIsPaused.selector, EMPTY_BYTES);
        }

        if (LibClearing.isClearingActivated()) {
            return (false, Eip1066.UNAVAILABLE, IClearing.ClearingIsActivated.selector, EMPTY_BYTES);
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _isCompliant(
        address _sender,
        address _from,
        address _to,
        uint256 _value,
        bool _checkSender
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        IERC3643Management.ERC3643Storage storage s = erc3643Storage();

        if (_checkSender) {
            if (!LibControlList.isAbleToAccess(_sender)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IControlListStorageWrapper.AccountIsBlocked.selector,
                    abi.encode(_sender)
                );
            }
            if (LibCompliance.isRecovered(_sender)) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643Management.WalletRecovered.selector,
                    abi.encode(_sender)
                );
            }
            bytes memory complianceResultSender = address(s.compliance).functionStaticCall(
                abi.encodeWithSelector(ICompliance.canTransfer.selector, _sender, address(0), 0),
                IERC3643Management.ComplianceCallFailed.selector
            );

            if (complianceResultSender.length > 0 && !abi.decode(complianceResultSender, (bool))) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IERC3643Management.ComplianceNotAllowed.selector,
                    abi.encode(_from, _to, _value)
                );
            }
        }
        if (_from != address(0)) {
            if (LibCompliance.isRecovered(_from)) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643Management.WalletRecovered.selector,
                    abi.encode(_from)
                );
            }

            if (!LibControlList.isAbleToAccess(_from)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IControlListStorageWrapper.AccountIsBlocked.selector,
                    abi.encode(_from)
                );
            }
        }
        if (_to != address(0)) {
            if (LibCompliance.isRecovered(_to)) {
                return (false, Eip1066.REVOKED_OR_BANNED, IERC3643Management.WalletRecovered.selector, abi.encode(_to));
            }

            if (!LibControlList.isAbleToAccess(_to)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IControlListStorageWrapper.AccountIsBlocked.selector,
                    abi.encode(_to)
                );
            }
        }

        bytes memory complianceResult = address(s.compliance).functionStaticCall(
            abi.encodeWithSelector(ICompliance.canTransfer.selector, _from, _to, _value),
            IERC3643Management.ComplianceCallFailed.selector
        );

        if (complianceResult.length > 0 && !abi.decode(complianceResult, (bool))) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                IERC3643Management.ComplianceNotAllowed.selector,
                abi.encode(_from, _to, _value)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _isIdentified(
        address _from,
        address _to
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        IERC3643Management.ERC3643Storage storage s = erc3643Storage();

        if (_from != address(0)) {
            if (!LibKyc.verifyKycStatus(IKyc.KycStatus.GRANTED, _from)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(_from));
            }

            bytes memory isVerifiedFrom = s.identityRegistry.functionStaticCall(
                abi.encodeWithSelector(IIdentityRegistry.isVerified.selector, _from),
                IERC3643Management.IdentityRegistryCallFailed.selector
            );

            if (isVerifiedFrom.length > 0 && !abi.decode(isVerifiedFrom, (bool))) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IERC3643Management.AddressNotVerified.selector,
                    abi.encode(_from)
                );
            }
        }

        if (_to != address(0)) {
            if (!LibKyc.verifyKycStatus(IKyc.KycStatus.GRANTED, _to)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(_to));
            }

            bytes memory isVerifiedTo = s.identityRegistry.functionStaticCall(
                abi.encodeWithSelector(IIdentityRegistry.isVerified.selector, _to),
                IERC3643Management.IdentityRegistryCallFailed.selector
            );

            if (isVerifiedTo.length > 0 && !abi.decode(isVerifiedTo, (bool))) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IERC3643Management.AddressNotVerified.selector,
                    abi.encode(_to)
                );
            }
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _businessLogicChecks(
        bool _checkAllowance,
        address _sender,
        address _from,
        uint256 _value,
        bytes32 _partition,
        uint256 _timestamp
    ) private view returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (_checkAllowance) {
            uint256 currentAllowance = _allowanceAdjustedAt(_from, _sender, _timestamp);
            if (currentAllowance < _value) {
                return (
                    false,
                    Eip1066.INSUFFICIENT_FUNDS,
                    IERC20StorageWrapper.InsufficientAllowance.selector,
                    abi.encode(_sender, _from, currentAllowance, _value, _DEFAULT_PARTITION)
                );
            }
        }

        if (!LibERC1410.validPartition(_partition, _from)) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                IERC1410StorageWrapper.InvalidPartition.selector,
                abi.encode(_from, _partition)
            );
        }

        uint256 currentPartitionBalance = LibABAF.balanceOfByPartitionAdjustedAt(_partition, _from, _timestamp);
        if (currentPartitionBalance < _value) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                IERC1410StorageWrapper.InsufficientBalance.selector,
                abi.encode(_from, currentPartitionBalance, _value, _partition)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _allowanceAdjustedAt(address _owner, address _spender, uint256 _timestamp) private view returns (uint256) {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getAllowanceLabaf(_owner, _spender)
        );
        return erc20Storage().allowed[_owner][_spender] * factor;
    }
}
