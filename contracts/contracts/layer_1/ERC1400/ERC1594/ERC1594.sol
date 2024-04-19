// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IStaticFunctionSelectors
} from '../../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_ERC1594_RESOLVER_KEY} from '../../constants/resolverKeys.sol';
import {ERC1594StorageWrapper} from './ERC1594StorageWrapper.sol';
import {_ISSUER_ROLE} from '../../constants/roles.sol';
import {IERC1594} from '../../interfaces/ERC1400/IERC1594.sol';

contract ERC1594 is IERC1594, IStaticFunctionSelectors, ERC1594StorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594()
        external
        virtual
        override
        onlyUninitialized(_getErc1594Storage().initialized)
        returns (bool success_)
    {
        return super._initialize_ERC1594();
    }

    // solhint-disable no-unused-vars
    /**
     * @notice Transfer restrictions can take many forms and typically involve on-chain rules or whitelists.
     * However for many types of approved transfers, maintaining an on-chain list of approved transfers can be
     * cumbersome and expensive. An alternative is the co-signing approach, where in addition to the token holder
     * approving a token transfer, and authorised entity provides signed data which further validates the transfer.
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @param _data The `bytes calldata _data` allows arbitrary data to be submitted alongside the transfer.
     * for the token contract to interpret or record. This could be signed data authorising the transfer
     * (e.g. a dynamic whitelist) but is flexible enough to accomadate other use-cases.
     */
    function transferWithData(
        address _to,
        uint256 _value,
        bytes calldata _data // solhint-disable-line no-unused-vars
    )
        external
        virtual
        override
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(_to)
        onlyWithoutMultiPartition
    {
        // Add a function to validate the `_data` parameter
        _transfer(_msgSender(), _to, _value);
    }

    /**
     * @notice Transfer restrictions can take many forms and typically involve on-chain rules or whitelists.
     * However for many types of approved transfers, maintaining an on-chain list of approved transfers can be
     * cumbersome and expensive. An alternative is the co-signing approach, where in addition to the token holder
     * approving a token transfer, and authorised entity provides signed data which further validates the transfer.
     * @dev `msg.sender` MUST have a sufficient `allowance` set and this `allowance` must be debited by the `_value`.
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @param _data The `bytes calldata _data` allows arbitrary data to be submitted alongside the transfer.
     * for the token contract to interpret or record. This could be signed data authorising the transfer
     * (e.g. a dynamic whitelist) but is flexible enough to accomadate other use-cases.
     */
    function transferFromWithData(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data // solhint-disable-line no-unused-vars
    )
        external
        virtual
        override
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(_to)
        checkControlList(_from)
        onlyWithoutMultiPartition
    {
        // Add a function to validate the `_data` parameter
        _transferFrom(_msgSender(), _from, _to, _value);
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
    function issue(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_ISSUER_ROLE)
        checkControlList(_tokenHolder)
        onlyWithoutMultiPartition
        onlyIssuable
    {
        _issue(_tokenHolder, _value, _data);
    }

    /**
     * @notice This function redeem an amount of the token of a msg.sender. For doing so msg.sender may incentivize
     * using different ways that could be implemented with in the `redeem` function definition. But those
     * implementations are out of the scope of the ERC1594.
     * @param _value The amount of tokens need to be redeemed
     * @param _data The `bytes calldata _data` it can be used in the token contract to authenticate the redemption.
     */
    function redeem(
        uint256 _value,
        bytes calldata _data
    )
        external
        virtual
        override
        onlyUnpaused
        checkControlList(_msgSender())
        onlyWithoutMultiPartition
    {
        _redeem(_value, _data);
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
    function redeemFrom(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    )
        external
        virtual
        override
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(_tokenHolder)
        onlyWithoutMultiPartition
    {
        _redeemFrom(_tokenHolder, _value, _data);
    }

    /**
     * @notice A security token issuer can specify that issuance has finished for the token
     * (i.e. no new tokens can be minted or issued).
     * @dev If a token returns FALSE for `isIssuable()` then it MUST always return FALSE in the future.
     * If a token returns FALSE for `isIssuable()` then it MUST never allow additional tokens to be issued.
     * @return bool `true` signifies the minting is allowed. While `false` denotes the end of minting
     */
    function isIssuable() external view virtual override returns (bool) {
        return _isIssuable();
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
    function canTransfer(
        address _to,
        uint256 _value,
        bytes calldata _data // solhint-disable-line no-unused-vars
    )
        external
        view
        virtual
        override
        onlyWithoutMultiPartition
        returns (bool, bytes1, bytes32)
    {
        return _canTransfer(_to, _value, _data);
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
    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data // solhint-disable-line no-unused-vars
    )
        external
        view
        virtual
        override
        onlyWithoutMultiPartition
        returns (bool, bytes1, bytes32)
    {
        return _canTransferFrom(_from, _to, _value, _data);
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

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC1594_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](9);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this
            .initialize_ERC1594
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .transferWithData
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .transferFromWithData
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.isIssuable.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.issue.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.redeem.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.redeemFrom.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.canTransfer.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .canTransferFrom
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
        staticInterfaceIds_[selectorsIndex++] = type(IERC1594).interfaceId;
    }
}
