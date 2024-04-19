// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {_ERC1594_STORAGE_POSITION} from '../../constants/storagePositions.sol';
import {
    IERC1594StorageWrapper
} from '../../interfaces/ERC1400/IERC1594StorageWrapper.sol';
import {
    _IS_PAUSED_ERROR_ID,
    _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID,
    _FROM_ACCOUNT_BLOCKED_ERROR_ID,
    _FROM_ACCOUNT_NULL_ERROR_ID,
    _TO_ACCOUNT_BLOCKED_ERROR_ID,
    _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID,
    _TO_ACCOUNT_NULL_ERROR_ID,
    _ALLOWANCE_REACHED_ERROR_ID,
    _SUCCESS
} from '../../constants/values.sol';
import {ERC20StorageWrapper} from '../ERC20/ERC20StorageWrapper.sol';

abstract contract ERC1594StorageWrapper is
    ERC20StorageWrapper,
    IERC1594StorageWrapper
{
    struct ERC1594Storage {
        bool issuance;
        bool initialized;
    }

    modifier onlyIssuable() {
        if (!_isIssuable()) {
            revert IssuanceIsClosed();
        }
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1594() internal virtual returns (bool success_) {
        _getErc1594Storage().issuance = true;
        _getErc1594Storage().initialized = true;
        success_ = true;
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
        bytes calldata _data
    ) internal virtual {
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
    function _redeem(uint256 _value, bytes calldata _data) internal virtual {
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
        bytes calldata _data
    ) internal virtual {
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
    function _isIssuable() internal view virtual returns (bool) {
        return _getErc1594Storage().issuance;
    }

    /**
     * @notice Transfers of securities may fail for a number of reasons. So this function will used to understand the
     * cause of failure by getting the byte value. Which will be the ESC that follows the EIP 1066. ESC can be mapped
     * with a reson string to understand the failure cause, table of Ethereum status code will always reside off-chain
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @param _data The `bytes calldata _data` allows arbitrary data to be submitted alongside the transfer.
     * @return bool It signifies whether the transaction will be executed or not.
     * @return byte Ethereum status code (ESC)
     * @return bytes32 Application specific reason code
     */
    function _canTransfer(
        address _to,
        uint256 _value,
        bytes calldata _data // solhint-disable-line no-unused-vars
    ) internal view virtual returns (bool, bytes1, bytes32) {
        if (_isPaused()) {
            return (false, _IS_PAUSED_ERROR_ID, bytes32(0));
        }
        if (_to == address(0)) {
            return (false, _TO_ACCOUNT_NULL_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_msgSender())) {
            return (false, _FROM_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_to)) {
            return (false, _TO_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (_getERC1410BasicStorage().balances[_msgSender()] < _value) {
            return (false, _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID, bytes32(0));
        }

        return (true, _SUCCESS, bytes32(0));
    }

    /**
     * @notice Transfers of securities may fail for a number of reasons. So this function will used to understand the
     * cause of failure by getting the byte value. Which will be the ESC that follows the EIP 1066. ESC can be mapped
     * with a reson string to understand the failure cause, table of Ethereum status code will always reside off-chain
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @param _data The `bytes calldata _data` allows arbitrary data to be submitted alongside the transfer.
     * @return bool It signifies whether the transaction will be executed or not.
     * @return byte Ethereum status code (ESC)
     * @return bytes32 Application specific reason code
     */
    function _canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data // solhint-disable-line no-unused-vars
    ) internal view virtual returns (bool, bytes1, bytes32) {
        if (_isPaused()) {
            return (false, _IS_PAUSED_ERROR_ID, bytes32(0));
        }
        if (_to == address(0)) {
            return (false, _TO_ACCOUNT_NULL_ERROR_ID, bytes32(0));
        }
        if (_from == address(0)) {
            return (false, _FROM_ACCOUNT_NULL_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_msgSender())) {
            return (false, _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_from)) {
            return (false, _FROM_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (!_checkControlList(_to)) {
            return (false, _TO_ACCOUNT_BLOCKED_ERROR_ID, bytes32(0));
        }
        if (_getErc20Storage().allowed[_from][_msgSender()] < _value) {
            return (false, _ALLOWANCE_REACHED_ERROR_ID, bytes32(0));
        }
        if (_getERC1410BasicStorage().balances[_from] < _value) {
            return (false, _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID, bytes32(0));
        }

        return (true, _SUCCESS, bytes32(0));
    }

    function _getErc1594Storage()
        internal
        pure
        virtual
        returns (ERC1594Storage storage erc1594Storage_)
    {
        bytes32 position = _ERC1594_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1594Storage_.slot := position
        }
    }
}
