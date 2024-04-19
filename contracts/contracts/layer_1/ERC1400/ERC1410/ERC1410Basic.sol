// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IERC1410Basic} from '../../interfaces/ERC1400/IERC1410Basic.sol';
import {ERC1410BasicStorageWrapper} from './ERC1410BasicStorageWrapper.sol';

abstract contract ERC1410Basic is IERC1410Basic, ERC1410BasicStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410_Basic(
        bool _multiPartition
    )
        external
        virtual
        override
        onlyUninitialized(_getERC1410BasicStorage().initialized)
        returns (bool success_)
    {
        _getERC1410BasicStorage().multiPartition = _multiPartition;
        _getERC1410BasicStorage().initialized = true;
        success_ = true;
    }

    /// @notice Transfers the ownership of tokens from a specified partition from one address to another address
    /// @param _partition The partition from which to transfer tokens
    /// @param _to The address to which to transfer tokens to
    /// @param _value The amount of tokens to transfer from `_partition`
    /// @param _data Additional data attached to the transfer of tokens
    /// @return The partition to which the transferred tokens were allocated for the _to address
    function transferByPartition(
        bytes32 _partition,
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        external
        virtual
        override
        onlyUnpaused
        onlyValidAddress(_to)
        checkControlList(_msgSender())
        checkControlList(_to)
        onlyDefaultPartitionWithSinglePartition(_partition)
        returns (bytes32)
    {
        // Add a function to verify the `_data` parameter
        // TODO: Need to create the bytes division of the `_partition` so it can be easily findout in which receiver's
        // partition token will transfered. For current implementation we are assuming that the receiver's partition
        // will be same as sender's as well as it also pass the `_validPartition()` check. In this particular case we
        // are also assuming that reciever has the some tokens of the same partition as well (To avoid the array index
        // out of bound error).
        // Note- There is no operator used for the execution of this call so `_operator` value in
        // in event is address(0) same for the `_operatorData`
        _transferByPartition(
            msg.sender,
            _to,
            _value,
            _partition,
            _data,
            address(0),
            ''
        );
    }

    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() external view virtual override returns (uint256) {
        return _totalSupply();
    }

    /**
     * @return
     *  true : the token allows multiple partitions to be set and managed
     *  false : the token contains only one partition, the default one
     */
    function isMultiPartition() external view returns (bool) {
        return _isMultiPartition();
    }

    /**
     * @dev Total number of tokens in existence in a partition
     */
    function totalSupplyByPartition(
        bytes32 _partition
    ) external view virtual override returns (uint256) {
        return _totalSupplyByPartition(_partition);
    }

    /// @notice Counts the sum of all partitions balances assigned to an owner
    /// @param _tokenHolder An address for whom to query the balance
    /// @return The number of tokens owned by `_tokenHolder`, possibly zero
    function balanceOf(
        address _tokenHolder
    ) external view virtual override returns (uint256) {
        return _balanceOf(_tokenHolder);
    }

    /// @notice Counts the balance associated with a specific partition assigned to an tokenHolder
    /// @param _partition The partition for which to query the balance
    /// @param _tokenHolder An address for whom to query the balance
    /// @return The number of tokens owned by `_tokenHolder` with the metadata associated with `_partition`,
    ////        possibly zero
    function balanceOfByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view virtual override returns (uint256) {
        return _balanceOfByPartition(_partition, _tokenHolder);
    }

    /// @notice Use to get the list of partitions `_tokenHolder` is associated with
    /// @param _tokenHolder An address corresponds whom partition list is queried
    /// @return List of partitions
    function partitionsOf(
        address _tokenHolder
    ) external view virtual override returns (bytes32[] memory) {
        return _partitionsOf(_tokenHolder);
    }
}
