// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {_ERC20_STORAGE_POSITION} from '../../constants/storagePositions.sol';
import {_DEFAULT_PARTITION} from '../../constants/values.sol';
import {IERC20} from '../../interfaces/ERC1400/IERC20.sol';
import {
    IERC20StorageWrapper
} from '../../interfaces/ERC1400/IERC20StorageWrapper.sol';
import {
    ERC1410StandardStorageWrapper
} from '../ERC1410/ERC1410StandardStorageWrapper.sol';
import {IFactory} from '../../../interfaces/factory/IFactory.sol';

abstract contract ERC20StorageWrapper is
    ERC1410StandardStorageWrapper,
    IERC20StorageWrapper
{
    struct ERC20Storage {
        string name;
        string symbol;
        string isin;
        uint8 decimals;
        bool initialized;
        mapping(address => mapping(address => uint256)) allowed;
        IFactory.SecurityType securityType;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function _approve(
        address spender,
        uint256 value
    ) internal virtual returns (bool) {
        if (spender == address(0)) {
            revert SpenderWithZeroAddress();
        }

        _getErc20Storage().allowed[_msgSender()][spender] = value;
        emit Approval(_msgSender(), spender, value);
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed_[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param spender The address which will spend the funds.
     * @param addedValue The amount of tokens to increase the allowance by.
     */
    function _increaseAllowance(
        address spender,
        uint256 addedValue
    ) internal virtual returns (bool) {
        if (spender == address(0)) {
            revert SpenderWithZeroAddress();
        }

        _getErc20Storage().allowed[_msgSender()][spender] += addedValue;
        emit Approval(
            _msgSender(),
            spender,
            _getErc20Storage().allowed[_msgSender()][spender]
        );
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed_[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param spender The address which will spend the funds.
     * @param subtractedValue The amount of tokens to decrease the allowance by.
     */
    function _decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) internal virtual returns (bool) {
        if (spender == address(0)) {
            revert SpenderWithZeroAddress();
        }
        _decreaseAllowedBalance(_msgSender(), spender, subtractedValue);
        emit Approval(
            _msgSender(),
            spender,
            _getErc20Storage().allowed[_msgSender()][spender]
        );
        return true;
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function _allowance(
        address owner,
        address spender
    ) internal view virtual returns (uint256) {
        return _getErc20Storage().allowed[owner][spender];
    }

    function _transferFrom(
        address spender,
        address from,
        address to,
        uint256 value
    ) internal virtual returns (bool) {
        _decreaseAllowedBalance(from, spender, value);
        bytes memory data;
        _transferByPartition(
            from,
            to,
            value,
            _DEFAULT_PARTITION,
            data,
            spender,
            ''
        );
        return _emitTransferEvent(from, to, value);
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal virtual returns (bool) {
        _transferByPartition(
            from,
            to,
            value,
            _DEFAULT_PARTITION,
            '',
            address(0),
            ''
        );
        return _emitTransferEvent(from, to, value);
    }

    function _mint(address to, uint256 value) internal virtual {
        bytes memory _data;
        _issueByPartition(_DEFAULT_PARTITION, to, value, _data);
        _emitTransferEvent(address(0), to, value);
    }

    function _burn(address from, uint256 value) internal virtual {
        bytes memory _data;
        _redeemByPartition(
            _DEFAULT_PARTITION,
            from,
            address(0),
            value,
            _data,
            _data
        );
        _emitTransferEvent(from, address(0), value);
    }

    function _burnFrom(address account, uint256 value) internal virtual {
        _decreaseAllowedBalance(account, _msgSender(), value);
        _burn(account, value);
    }

    function _decreaseAllowedBalance(
        address from,
        address spender,
        uint256 value
    ) private {
        ERC20Storage storage erc20Storage = _getErc20Storage();
        if (value > erc20Storage.allowed[from][spender]) {
            revert InsufficientAllowance(spender, from);
        }
        erc20Storage.allowed[from][spender] -= value;
    }

    function _emitTransferEvent(
        address from,
        address to,
        uint256 value
    ) private returns (bool) {
        emit Transfer(from, to, value);
        return true;
    }

    function _getERC20Metadata()
        internal
        view
        virtual
        returns (IERC20.ERC20Metadata memory erc20Metadata_)
    {
        ERC20Storage storage erc20Storage = _getErc20Storage();
        IERC20.ERC20MetadataInfo memory erc20Info = IERC20.ERC20MetadataInfo({
            name: erc20Storage.name,
            symbol: erc20Storage.symbol,
            isin: erc20Storage.isin,
            decimals: erc20Storage.decimals
        });
        erc20Metadata_ = IERC20.ERC20Metadata({
            info: erc20Info,
            securityType: erc20Storage.securityType
        });
    }

    function _getErc20Storage()
        internal
        view
        virtual
        returns (ERC20Storage storage erc20Storage_)
    {
        bytes32 position = _ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }
}
