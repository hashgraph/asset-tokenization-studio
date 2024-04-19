// SPDX-License-Identifier: MIT
// Contract copy-pasted form OZ and extended

pragma solidity 0.8.18;

import {ERC20StorageWrapper} from './ERC20StorageWrapper.sol';
import {IERC20} from '../../interfaces/ERC1400/IERC20.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_ERC20_RESOLVER_KEY} from '../../constants/resolverKeys.sol';

contract ERC20 is IERC20, IStaticFunctionSelectors, ERC20StorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(
        ERC20Metadata calldata erc20Metadata
    )
        external
        virtual
        override
        onlyUninitialized(_getErc20Storage().initialized)
        returns (bool success_)
    {
        ERC20Storage storage erc20Storage = _getErc20Storage();
        erc20Storage.name = erc20Metadata.info.name;
        erc20Storage.symbol = erc20Metadata.info.symbol;
        erc20Storage.isin = erc20Metadata.info.isin;
        erc20Storage.decimals = erc20Metadata.info.decimals;
        erc20Storage.securityType = erc20Metadata.securityType;
        erc20Storage.initialized = true;
        success_ = true;
    }

    // solhint-disable no-unused-vars
    function approve(
        address spender,
        uint256 value
    )
        external
        virtual
        override
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(spender)
        onlyWithoutMultiPartition
        returns (bool)
    {
        return _approve(spender, value);
    }

    function transfer(
        address to,
        uint256 value
    )
        external
        virtual
        override
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(to)
        onlyWithoutMultiPartition
        returns (bool)
    {
        return _transfer(_msgSender(), to, value);
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    )
        external
        virtual
        override
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(from)
        checkControlList(to)
        onlyWithoutMultiPartition
        returns (bool)
    {
        return _transferFrom(_msgSender(), from, to, value);
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    )
        external
        virtual
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(spender)
        onlyWithoutMultiPartition
        returns (bool)
    {
        return _increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    )
        external
        virtual
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(spender)
        onlyWithoutMultiPartition
        returns (bool)
    {
        return _decreaseAllowance(spender, subtractedValue);
    }

    function allowance(
        address owner,
        address spender
    ) external view virtual override returns (uint256) {
        return _allowance(owner, spender);
    }

    function name() external view returns (string memory) {
        return _getERC20Metadata().info.name;
    }

    function symbol() external view returns (string memory) {
        return _getERC20Metadata().info.symbol;
    }

    function decimals() external view returns (uint8) {
        return _getERC20Metadata().info.decimals;
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

    function getERC20Metadata()
        external
        view
        virtual
        returns (ERC20Metadata memory)
    {
        return _getERC20Metadata();
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC20_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](11);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this
            .initialize_ERC20
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.approve.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.transfer.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.transferFrom.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .increaseAllowance
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .decreaseAllowance
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.allowance.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .getERC20Metadata
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.name.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.symbol.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.decimals.selector;
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
        staticInterfaceIds_[selectorsIndex++] = type(IERC20).interfaceId;
    }
}
