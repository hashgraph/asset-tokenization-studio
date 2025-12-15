// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ZERO_ADDRESS, EMPTY_BYTES, _DEFAULT_PARTITION } from "../../../layer_0/constants/values.sol";
import { _ERC1594_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKyc } from "../../../layer_1/interfaces/kyc/IKyc.sol";
import { IERC1594StorageWrapper } from "../../../layer_1/interfaces/ERC1400/IERC1594StorageWrapper.sol";
import { Eip1066 } from "../../constants/eip1066.sol";
import { CapStorageWrapper2 } from "../../cap/CapStorageWrapper2.sol";
import { IClearing } from "../../../layer_1/interfaces/clearing/IClearing.sol";
import { IERC3643Management } from "../../../layer_1/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../../layer_1/interfaces/ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "../../../layer_1/interfaces/ERC3643/IIdentityRegistry.sol";
import { LowLevelCall } from "../../common/libraries/LowLevelCall.sol";

abstract contract ERC1594StorageWrapper is IERC1594StorageWrapper, CapStorageWrapper2 {
    using LowLevelCall for address;

    struct ERC1594Storage {
        bool issuance;
        bool initialized;
    }

    modifier onlyIssuable() override {
        _checkIssuable();
        _;
    }

    modifier onlyCanTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory,
        bytes memory
    ) override {
        _checkCanTransferFromByPartition(_from, _to, _partition, _value, EMPTY_BYTES, EMPTY_BYTES);
        _;
    }

    modifier onlyCanRedeemFromByPartition(address _from, bytes32 _partition, uint256 _value, bytes memory, bytes memory)
        override
    {
        _checkCanRedeemFromByPartition(_from, _partition, _value, EMPTY_BYTES, EMPTY_BYTES);
        _;
    }

    modifier onlyIdentified(address _from, address _to) override {
        _checkIdentity(_from, _to);
        _;
    }

    modifier onlyCompliant(address _from, address _to, bool _checkSender) override {
        _checkCompliance(_from, _to, _checkSender);
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1594() internal override {
        ERC1594Storage storage ds = _erc1594Storage();
        ds.issuance = true;
        ds.initialized = true;
    }

    // TODO: In this case are able to perform that operation another role?
    function _issue(address _tokenHolder, uint256 _value, bytes memory _data) internal {
        // Add a function to validate the `_data` parameter
        _mint(_tokenHolder, _value);
        emit Issued(_msgSender(), _tokenHolder, _value, _data);
    }

    function _redeem(uint256 _value, bytes memory _data) internal override {
        // Add a function to validate the `_data` parameter
        _burn(_msgSender(), _value);
        emit Redeemed(address(0), _msgSender(), _value, _data);
    }

    function _redeemFrom(address _tokenHolder, uint256 _value, bytes memory _data) internal {
        // Add a function to validate the `_data` parameter
        _burnFrom(_tokenHolder, _value);
        emit Redeemed(_msgSender(), _tokenHolder, _value, _data);
    }

    function _isIssuable() internal view returns (bool) {
        return _erc1594Storage().issuance;
    }

    function _checkIssuable() internal view {
        if (!_isIssuable()) revert IssuanceIsClosed();
    }

    function _checkCanRedeemFromByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes memory,
        bytes memory
    ) internal view {
        (bool isAbleToRedeemFrom, , bytes32 reasonCode, bytes memory details) = _isAbleToRedeemFromByPartition(
            _from,
            _partition,
            _value,
            EMPTY_BYTES,
            EMPTY_BYTES
        );
        if (!isAbleToRedeemFrom) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function _isAbleToRedeemFromByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view returns (bool isAbleToRedeemFrom, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _genericChecks();
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        // Format validation
        if (_from == ZERO_ADDRESS) {
            return (false, Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE, AccountIsBlocked.selector, EMPTY_BYTES);
        }

        bool checkSender = _from != _msgSender() && !_hasRole(_protectedPartitionsRole(_partition), _msgSender());

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _isCompliant(_from, address(0), _value, checkSender);
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        (isAbleToRedeemFrom, statusCode, reasonCode, details) = _isIdentified(_from, address(0));
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        // Allowance check for the 'from' methods
        bool checkAllowance = checkSender && !_isAuthorized(_partition, _msgSender(), _from);

        return _businessLogicChecks(checkAllowance, _from, _value, _partition);
    }

    function _checkCanTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view {
        (bool isAbleToTransfer, , bytes32 reasonCode, bytes memory details) = _isAbleToTransferFromByPartition(
            _from,
            _to,
            _partition,
            _value,
            EMPTY_BYTES,
            EMPTY_BYTES
        );
        if (!isAbleToTransfer) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function _isAbleToTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        (isAbleToTransfer, statusCode, reasonCode, details) = _genericChecks();
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        // Format validation
        if (_from == ZERO_ADDRESS || _to == ZERO_ADDRESS) {
            return (false, Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE, ZeroAddressNotAllowed.selector, EMPTY_BYTES);
        }

        bool checkSender = _from != _msgSender() && !_hasRole(_protectedPartitionsRole(_partition), _msgSender());

        (isAbleToTransfer, statusCode, reasonCode, details) = _isCompliant(_from, _to, _value, checkSender);
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        (isAbleToTransfer, statusCode, reasonCode, details) = _isIdentified(_from, _to);
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        // Allowance check for the 'from' methods
        bool checkAllowance = checkSender && !_isAuthorized(_partition, _msgSender(), _from);

        return _businessLogicChecks(checkAllowance, _from, _value, _partition);
    }

    function _checkIdentity(address _from, address _to) internal view override {
        (bool isIdentified, , bytes32 reasonCode, bytes memory details) = _isIdentified(_from, _to);
        if (!isIdentified) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function _checkCompliance(address _from, address _to, bool _checkSender) internal view override {
        (bool isCompliant, , bytes32 reasonCode, bytes memory details) = _isCompliant(_from, _to, 0, _checkSender);
        if (!isCompliant) {
            LowLevelCall.revertWithData(bytes4(reasonCode), details);
        }
    }

    function _erc1594Storage() internal pure returns (ERC1594Storage storage ds) {
        bytes32 position = _ERC1594_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    function _genericChecks() private view returns (bool, bytes1, bytes32, bytes memory) {
        // Application specific checks
        if (_isPaused()) {
            return (false, Eip1066.PAUSED, TokenIsPaused.selector, EMPTY_BYTES);
        }

        if (_isClearingActivated()) {
            return (false, Eip1066.UNAVAILABLE, IClearing.ClearingIsActivated.selector, EMPTY_BYTES);
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _isCompliant(
        address _from,
        address _to,
        uint256 _value,
        bool _checkSender
    ) private view returns (bool status, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        // Check sender for blocked status and recovery status when required
        if (_checkSender) {
            if (!_isAbleToAccess(_msgSender())) {
                return (false, Eip1066.DISALLOWED_OR_STOP, AccountIsBlocked.selector, abi.encode(_msgSender()));
            }
            if (_isRecovered(_msgSender())) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643Management.WalletRecovered.selector,
                    abi.encode(_msgSender())
                );
            }
            // Compliance check for sender in compliance module (amount is 0)
            bytes memory complianceResultSender = (_erc3643Storage().compliance).functionStaticCall(
                abi.encodeWithSelector(ICompliance.canTransfer.selector, _msgSender(), address(0), 0),
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
            if (_isRecovered(_from)) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643Management.WalletRecovered.selector,
                    abi.encode(_from)
                );
            }

            if (!_isAbleToAccess(_from)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, AccountIsBlocked.selector, abi.encode(_from));
            }
        }
        if (_to != address(0)) {
            if (_isRecovered(_to)) {
                return (false, Eip1066.REVOKED_OR_BANNED, IERC3643Management.WalletRecovered.selector, abi.encode(_to));
            }

            if (!_isAbleToAccess(_to)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, AccountIsBlocked.selector, abi.encode(_to));
            }
        }

        // Compliance module check
        bytes memory complianceResult = (_erc3643Storage().compliance).functionStaticCall(
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
        if (_from != address(0)) {
            if (!_verifyKycStatus(IKyc.KycStatus.GRANTED, _from)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(_from));
            }

            bytes memory isVerifiedFrom = (_erc3643Storage().identityRegistry).functionStaticCall(
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
            if (!_verifyKycStatus(IKyc.KycStatus.GRANTED, _to)) {
                return (false, Eip1066.DISALLOWED_OR_STOP, IKyc.InvalidKycStatus.selector, abi.encode(_to));
            }

            bytes memory isVerifiedTo = (_erc3643Storage().identityRegistry).functionStaticCall(
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
        address _from,
        uint256 _value,
        bytes32 _partition
    ) private view returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details) {
        if (_checkAllowance) {
            uint256 currentAllowance = _allowanceAdjusted(_from, _msgSender());
            if (currentAllowance < _value) {
                return (
                    false,
                    Eip1066.INSUFFICIENT_FUNDS,
                    InsufficientAllowance.selector,
                    abi.encode(_msgSender(), _from, currentAllowance, _value, _DEFAULT_PARTITION)
                );
            }
        }

        // Partition validation check
        if (!_validPartition(_partition, _from)) {
            return (false, Eip1066.INSUFFICIENT_FUNDS, InvalidPartition.selector, abi.encode(_from, _partition));
        }

        // Balance check - check partition-specific balance
        uint256 currentPartitionBalance = _balanceOfByPartitionAdjusted(_partition, _from);
        if (currentPartitionBalance < _value) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                InsufficientBalance.selector,
                abi.encode(_from, currentPartitionBalance, _value, _partition)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }
}
