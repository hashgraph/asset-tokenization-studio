// Licensed under the Apache License, Version 2.0

// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    ZERO_ADDRESS,
    EMPTY_BYTES,
    DEFAULT_PARTITION
} from '../../../layer_0/constants/values.sol';
import {_ERC1594_STORAGE_POSITION} from '../../constants/storagePositions.sol';
import {IKyc} from '../../../layer_1/interfaces/kyc/IKyc.sol';
import {
    IERC1594StorageWrapper
} from '../../../layer_1/interfaces/ERC1400/IERC1594StorageWrapper.sol';
import {Eip1066} from '../../constants/eip1066.sol';
import {CapStorageWrapper2} from '../../cap/CapStorageWrapper2.sol';
import {IClearing} from '../../../layer_1/interfaces/clearing/IClearing.sol';
import {IERC3643} from '../../../layer_1/interfaces/ERC3643/IERC3643.sol';
import {ICompliance} from '../../../layer_1/interfaces/ERC3643/ICompliance.sol';
import {LowLevelCall} from '../../common/libraries/LowLevelCall.sol';
import {Eip1066Lib} from '../../common/libraries/Eip1066Lib.sol';

abstract contract ERC1594StorageWrapper is
    IERC1594StorageWrapper,
    CapStorageWrapper2
{
    using LowLevelCall for address;

    struct ERC1594Storage {
        bool issuance;
        bool initialized;
    }

    modifier onlyIssuable() {
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
    ) {
        _checkCanTransferFromByPartition(
            _from,
            _to,
            _partition,
            _value,
            EMPTY_BYTES,
            EMPTY_BYTES
        );
        _;
    }

    modifier onlyCanRedeemFromByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes memory,
        bytes memory
    ) {
        _checkCanRedeemFromByPartition(
            _from,
            _partition,
            _value,
            EMPTY_BYTES,
            EMPTY_BYTES
        );
        _;
    }

    modifier onlyIdentified(address _from, address _to) {
        _checkIdentity(_from, _to);
        _;
    }

    modifier onlyCompliant(address _from, address _to) {
        _checkCompliance(_from, _to);
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1594() internal {
        ERC1594Storage storage ds = _erc1594Storage();
        ds.issuance = true;
        ds.initialized = true;
    }

    /**
     * @notice This function must be called to increase the total supply (Corresponds to mint function of ERC20).
     * @dev It only be called by the token issuer or the operator defined by the issuer. ERC1594 doesn't have
     * have the any logic related to operator but its superset ERC1400 have the operator logic and this function
     * is allowed to call by the operator.
     * @param _tokenHolder The account that will receive the created tokens (account should be whitelisted or KYCed).
     * @param _value The amount of tokens need to be issued
     * @param _data The `bytes calldata _data` allows arbitrary data to be submitted alongside the transfer.
     */
    // TODO: In this case are able to perform that operation another role?
    function _issue(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data
    ) internal {
        // Add a function to validate the `_data` parameter
        _mint(_tokenHolder, _value);
        emit Issued(_msgSender(), _tokenHolder, _value, _data);
    }

    /**
     * @notice This function redeem an amount of the token of a msg.sender. For doing so msg.sender may incentivize
     * using different ways that could be implemented with in the `redeem` function definition. But those
     * implementations are out of the scope of the ERC1594.
     * @param _value The amount of tokens need to be redeemed
     * @param _data The `bytes calldata _data` it can be used in the token contract to authenticate the redemption.
     */
    function _redeem(uint256 _value, bytes memory _data) internal {
        // Add a function to validate the `_data` parameter
        _burn(_msgSender(), _value);
        emit Redeemed(address(0), _msgSender(), _value, _data);
    }

    /**
     * @notice This function redeem an amount of the token of a msg.sender. For doing so msg.sender may incentivize
     * using different ways that could be implemented with in the `redeem` function definition. But those
     * implementations are out of the scope of the ERC1594.
     * @dev It is analogy to `transferFrom`
     * @param _tokenHolder The account whose tokens gets redeemed.
     * @param _value The amount of tokens need to be redeemed
     * @param _data The `bytes calldata _data` it can be used in the token contract to authenticate the redemption.
     */
    function _redeemFrom(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data
    ) internal {
        // Add a function to validate the `_data` parameter
        _burnFrom(_tokenHolder, _value);
        emit Redeemed(_msgSender(), _tokenHolder, _value, _data);
    }

    /**
     * @notice A security token issuer can specify that issuance has finished for the token
     * (i.e. no new tokens can be minted or issued).
     * @dev If a token returns FALSE for `isIssuable()` then it MUST always return FALSE in the future.
     * If a token returns FALSE for `isIssuable()` then it MUST never allow additional tokens to be issued.
     * @return bool `true` signifies the minting is allowed. While `false` denotes the end of minting
     */
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
        (
            bool isAbleToRedeemFrom,
            ,
            bytes32 reasonCode,
            bytes memory details
        ) = _isAbleToRedeemFromByPartition(
                _from,
                _partition,
                _value,
                EMPTY_BYTES,
                EMPTY_BYTES
            );
        if (!isAbleToRedeemFrom) {
            Eip1066Lib.revertWithData(reasonCode, details);
        }
    }

    function _isAbleToRedeemFromByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    )
        internal
        view
        returns (
            bool isAbleToRedeemFrom,
            bytes1 statusCode,
            bytes32 reasonCode,
            bytes memory details
        )
    {
        // Generic checks
        (
            isAbleToRedeemFrom,
            statusCode,
            reasonCode,
            details
        ) = _genericChecks();
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        // Format validation
        if (_from == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                AccountIsBlocked.selector,
                EMPTY_BYTES
            );
        }

        // Basic compliance
        (
            isAbleToRedeemFrom,
            statusCode,
            reasonCode,
            details
        ) = _validateRedemption(_from);
        if (!isAbleToRedeemFrom) {
            return (isAbleToRedeemFrom, statusCode, reasonCode, details);
        }

        // From methods checks (if not owner)
        bool shouldCheckSender = _from != _msgSender() &&
            !_isAuthorized(_partition, _msgSender(), _from) &&
            !_hasRole(_protectedPartitionsRole(_partition), _msgSender());

        if (shouldCheckSender) {
            (
                isAbleToRedeemFrom,
                statusCode,
                reasonCode,
                details
            ) = _validateRedemptionSender(_from, _value);
            if (!isAbleToRedeemFrom) {
                return (isAbleToRedeemFrom, statusCode, reasonCode, details);
            }
        }

        // Business logic checks
        return _validateRedemptionBusinessLogic(_from, _partition, _value);
    }

    function _checkCanTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view {
        (
            bool isAbleToTransfer,
            ,
            bytes32 reasonCode,
            bytes memory details
        ) = _isAbleToTransferFromByPartition(
                _from,
                _to,
                _partition,
                _value,
                EMPTY_BYTES,
                EMPTY_BYTES
            );
        if (!isAbleToTransfer) {
            Eip1066Lib.revertWithData(reasonCode, details);
        }
    }

    function _isAbleToTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    )
        internal
        view
        returns (
            bool isAbleToTransfer,
            bytes1 statusCode,
            bytes32 reasonCode,
            bytes memory details
        )
    {
        // Generic checks
        (isAbleToTransfer, statusCode, reasonCode, details) = _genericChecks();
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }
        // Format validation
        if (_from == ZERO_ADDRESS || _to == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                ZeroAddressNotAllowed.selector,
                EMPTY_BYTES
            );
        }
        // Compliance check
        bool shouldCheckSender = _from != _msgSender() &&
            !_isAuthorized(_partition, _msgSender(), _from) &&
            !_hasRole(_protectedPartitionsRole(_partition), _msgSender());

        (isAbleToTransfer, statusCode, reasonCode, details) = _isCompliant(
            _from,
            _to,
            _value,
            shouldCheckSender
        );
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        // Identity check
        (isAbleToTransfer, statusCode, reasonCode, details) = _isIdentified(
            _from,
            _to
        );
        if (!isAbleToTransfer) {
            return (isAbleToTransfer, statusCode, reasonCode, details);
        }

        // Allowance check for non-owner transfers
        if (shouldCheckSender) {
            uint256 currentAllowance = _allowanceAdjusted(_from, _msgSender());
            if (currentAllowance < _value) {
                return (
                    false,
                    Eip1066.INSUFFICIENT_FUNDS,
                    InsufficientAllowance.selector,
                    abi.encode(
                        _msgSender(),
                        _from,
                        currentAllowance,
                        _value,
                        DEFAULT_PARTITION
                    )
                );
            }
        }

        // Balance check
        uint256 currentBalance = _balanceOfAdjusted(_from);
        if (currentBalance < _value) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                InsufficientBalance.selector,
                abi.encode(_from, currentBalance, _value, DEFAULT_PARTITION)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _checkIdentity(address _from, address _to) internal view override {
        (
            bool isIdentified,
            ,
            bytes32 reasonCode,
            bytes memory details
        ) = _isIdentified(_from, _to);
        if (!isIdentified) {
            Eip1066Lib.revertWithData(reasonCode, details);
        }
    }

    function _isIdentified(
        address _from,
        address _to
    )
        internal
        view
        returns (
            bool status,
            bytes1 statusCode,
            bytes32 reasonCode,
            bytes memory details
        )
    {
        if (_from != address(0)) {
            if (!_verifyKycStatus(IKyc.KycStatus.GRANTED, _from)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IKyc.InvalidKycStatus.selector,
                    abi.encode(_from)
                );
            }
        }
        if (_to != address(0)) {
            if (!_verifyKycStatus(IKyc.KycStatus.GRANTED, _to)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IKyc.InvalidKycStatus.selector,
                    abi.encode(_to)
                );
            }
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _checkCompliance(
        address _from,
        address _to
    ) internal view override {
        (
            bool isCompliant,
            ,
            bytes32 reasonCode,
            bytes memory details
        ) = _isCompliant(_from, _to, 0, false);
        if (!isCompliant) {
            Eip1066Lib.revertWithData(reasonCode, details);
        }
    }

    function _isCompliant(
        address _from,
        address _to,
        uint256 _value,
        bool _checkSender
    )
        internal
        view
        returns (
            bool status,
            bytes1 statusCode,
            bytes32 reasonCode,
            bytes memory details
        )
    {
        if (_checkSender) {
            if (!_isAbleToAccess(_msgSender())) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    AccountIsBlocked.selector,
                    abi.encode(_msgSender())
                );
            }
            if (_isRecovered(_msgSender())) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643.WalletRecovered.selector,
                    abi.encode(_msgSender())
                );
            }
        }
        if (_from != address(0)) {
            if (_isRecovered(_from)) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643.WalletRecovered.selector,
                    abi.encode(_from)
                );
            }

            if (!_isAbleToAccess(_from)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    AccountIsBlocked.selector,
                    abi.encode(_from)
                );
            }
        }
        if (_to != address(0)) {
            if (_isRecovered(_to)) {
                return (
                    false,
                    Eip1066.REVOKED_OR_BANNED,
                    IERC3643.WalletRecovered.selector,
                    abi.encode(_to)
                );
            }

            if (!_isAbleToAccess(_to)) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    AccountIsBlocked.selector,
                    abi.encode(_to)
                );
            }
        }

        // ERC3643 Compliance Check
        if (_from != address(0) && _to != address(0)) {
            bytes memory complianceResult = (_erc3643Storage().compliance)
                .functionStaticCall(
                    abi.encodeWithSelector(
                        ICompliance.canTransfer.selector,
                        _from,
                        _to,
                        _value
                    ),
                    IERC3643.ComplianceCallFailed.selector
                );

            if (!abi.decode(complianceResult, (bool))) {
                return (
                    false,
                    Eip1066.DISALLOWED_OR_STOP,
                    IERC3643.ComplianceCallFailed.selector,
                    abi.encode(_from, _to, 0)
                );
            }
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _genericChecks()
        internal
        view
        returns (bool, bytes1, bytes32, bytes memory)
    {
        // Application specific checks
        if (_isPaused()) {
            return (false, Eip1066.PAUSED, TokenIsPaused.selector, EMPTY_BYTES);
        }

        if (_isClearingActivated()) {
            return (
                false,
                Eip1066.UNAVAILABLE,
                IClearing.ClearingIsActivated.selector,
                EMPTY_BYTES
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _erc1594Storage()
        internal
        pure
        returns (ERC1594Storage storage ds)
    {
        bytes32 position = _ERC1594_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    function _validateRedemption(
        address _from
    )
        private
        view
        returns (
            bool isValid,
            bytes1 statusCode,
            bytes32 reasonCode,
            bytes memory details
        )
    {
        if (_isRecovered(_from)) {
            return (
                false,
                Eip1066.REVOKED_OR_BANNED,
                IERC3643.WalletRecovered.selector,
                abi.encode(_from)
            );
        }
        if (!_isAbleToAccess(_from)) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                AccountIsBlocked.selector,
                abi.encode(_from)
            );
        }
        if (!_verifyKycStatus(IKyc.KycStatus.GRANTED, _from)) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                IKyc.InvalidKycStatus.selector,
                abi.encode(_from)
            );
        }
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _validateRedemptionSender(
        address _from,
        uint256 _value
    )
        private
        view
        returns (
            bool isValid,
            bytes1 statusCode,
            bytes32 reasonCode,
            bytes memory details
        )
    {
        if (!_isAbleToAccess(_msgSender())) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                AccountIsBlocked.selector,
                abi.encode(_msgSender())
            );
        }
        if (_isRecovered(_msgSender())) {
            return (
                false,
                Eip1066.REVOKED_OR_BANNED,
                IERC3643.WalletRecovered.selector,
                abi.encode(_msgSender())
            );
        }
        if (_allowanceAdjusted(_from, _msgSender()) < _value) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                InsufficientAllowance.selector,
                abi.encode(
                    _msgSender(),
                    _from,
                    _allowanceAdjusted(_from, _msgSender()),
                    _value,
                    DEFAULT_PARTITION
                )
            );
        }
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }

    function _validateRedemptionBusinessLogic(
        address _from,
        bytes32 _partition,
        uint256 _value
    )
        private
        view
        returns (
            bool isValid,
            bytes1 statusCode,
            bytes32 reasonCode,
            bytes memory details
        )
    {
        if (!_validPartition(_partition, _from)) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                InvalidPartition.selector,
                abi.encode(_from, _partition)
            );
        }
        if (_balanceOfByPartitionAdjusted(_partition, _from) < _value) {
            return (
                false,
                Eip1066.INSUFFICIENT_FUNDS,
                InsufficientBalance.selector,
                abi.encode(
                    _from,
                    _balanceOfAdjusted(_from),
                    _value,
                    DEFAULT_PARTITION
                )
            );
        }
        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }
}
