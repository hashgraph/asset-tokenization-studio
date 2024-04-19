// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IERC1644} from '../../interfaces/ERC1400/IERC1644.sol';
import {_DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE} from '../../constants/roles.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_ERC1644_RESOLVER_KEY} from '../../constants/resolverKeys.sol';
import {ERC1644StorageWrapper} from './ERC1644StorageWrapper.sol';

contract ERC1644 is IERC1644, IStaticFunctionSelectors, ERC1644StorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(
        bool _controllable
    )
        external
        virtual
        override
        onlyUninitialized(_getErc1644Storage().initialized)
        returns (bool success_)
    {
        _getErc1644Storage().isControllable = _controllable;
        _getErc1644Storage().initialized = true;
        success_ = true;
    }

    // solhint-disable no-unused-vars
    /**
     * @notice This function allows an authorised address to transfer tokens between any two token holders.
     * The transfer must still respect the balances of the token holders (so the transfer must be for at most
     * `balanceOf(_from)` tokens) and potentially also need to respect other transfer restrictions.
     * @dev This function can only be executed by the `controller` address.
     * @param _from Address The address which you want to send tokens from
     * @param _to Address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @param _data data to validate the transfer. (It is not used in this reference implementation
     * because use of `_data` parameter is implementation specific).
     * @param _operatorData data attached to the transfer by controller to emit in event. (It is more like a reason
     * string for calling this function (aka force transfer) which provides the transparency on-chain).
     */
    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        virtual
        override
        onlyRole(_CONTROLLER_ROLE)
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyControllable
    {
        _controllerTransfer(_from, _to, _value, _data, _operatorData);
    }

    /**
     * @notice This function allows an authorised address to redeem tokens for any token holder.
     * The redemption must still respect the balances of the token holder (so the redemption must be for at most
     * `balanceOf(_tokenHolder)` tokens) and potentially also need to respect other transfer restrictions.
     * @dev This function can only be executed by the `controller` address.
     * @param _tokenHolder The account whose tokens will be redeemed.
     * @param _value uint256 the amount of tokens need to be redeemed.
     * @param _data data to validate the transfer. (It is not used in this reference implementation
     * because use of `_data` parameter is implementation specific).
     * @param _operatorData data attached to the transfer by controller to emit in event. (It is more like a reason
     * string for calling this function (aka force transfer) which provides the transparency on-chain).
     */
    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        virtual
        override
        onlyRole(_CONTROLLER_ROLE)
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyControllable
    {
        _controllerRedeem(_tokenHolder, _value, _data, _operatorData);
    }

    // solhint-disable no-empty-blocks
    function _beforeTokenTransfer(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value
    ) internal virtual override {}

    // solhint-enable no-empty-blocks
    // solhint-enable no-unused-vars

    /**
     * @notice In order to provide transparency over whether `controllerTransfer` / `controllerRedeem` are useable
     * or not `isControllable` function will be used.
     * @dev If `isControllable` returns `false` then it always return `false` and
     * `controllerTransfer` / `controllerRedeem` will always revert.
     * @return bool `true` when controller address is non-zero otherwise return `false`.
     */
    function isControllable() external view virtual override returns (bool) {
        return _isControllable();
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC1644_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](5);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this
            .initialize_ERC1644
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .isControllable
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .controllerTransfer
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .controllerRedeem
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .finalizeControllable
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1644).interfaceId;
    }

    /**
     * @notice It is used to end the controller feature from the token
     * @dev It only be called by the `owner/issuer` of the token
     */
    function finalizeControllable()
        external
        virtual
        override
        onlyRole(_DEFAULT_ADMIN_ROLE)
        onlyControllable
    {
        _finalizeControllable();
    }
}
