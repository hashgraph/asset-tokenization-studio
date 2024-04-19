// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IERC1410Operator} from '../../interfaces/ERC1400/IERC1410Operator.sol';
import {
    ERC1410OperatorStorageWrapper
} from './ERC1410OperatorStorageWrapper.sol';

abstract contract ERC1410Operator is
    IERC1410Operator,
    ERC1410OperatorStorageWrapper
{
    ///////////////////////
    /// Operator Management
    ///////////////////////

    /// @notice Authorises an operator for all partitions of `msg.sender`
    /// @param _operator An address which is being authorised
    function authorizeOperator(
        address _operator
    )
        external
        virtual
        override
        onlyUnpaused
        checkControlList(_msgSender())
        checkControlList(_operator)
    {
        _authorizeOperator(_operator);
    }

    /// @notice Revokes authorisation of an operator previously given for all partitions of `msg.sender`
    /// @param _operator An address which is being de-authorised
    function revokeOperator(
        address _operator
    ) external virtual override onlyUnpaused checkControlList(_msgSender()) {
        _revokeOperator(_operator);
    }

    /// @notice Authorises an operator for a given partition of `msg.sender`
    /// @param _partition The partition to which the operator is authorised
    /// @param _operator An address which is being authorised
    function authorizeOperatorByPartition(
        bytes32 _partition,
        address _operator
    )
        external
        virtual
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        checkControlList(_msgSender())
        checkControlList(_operator)
    {
        _authorizeOperatorByPartition(_partition, _operator);
    }

    /// @notice Revokes authorisation of an operator previously given for a specified partition of `msg.sender`
    /// @param _partition The partition to which the operator is de-authorised
    /// @param _operator An address which is being de-authorised
    function revokeOperatorByPartition(
        bytes32 _partition,
        address _operator
    )
        external
        virtual
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        checkControlList(_msgSender())
    {
        _revokeOperatorByPartition(_partition, _operator);
    }

    /// @notice Transfers the ownership of tokens from a specified partition from one address to another address
    /// @param _partition The partition from which to transfer tokens
    /// @param _from The address from which to transfer tokens from
    /// @param _to The address to which to transfer tokens to
    /// @param _value The amount of tokens to transfer from `_partition`
    /// @param _data Additional data attached to the transfer of tokens
    /// @param _operatorData Additional data attached to the transfer of tokens by the operator
    /// @return The partition to which the transferred tokens were allocated for the _to address
    function operatorTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        virtual
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        checkControlList(_msgSender())
        checkControlList(_from)
        checkControlList(_to)
        onlyOperator(_partition, _from)
        returns (bytes32)
    {
        {
            _checkValidAddress(_to);
        }
        return
            _operatorTransferByPartition(
                _partition,
                _from,
                _to,
                _value,
                _data,
                _operatorData
            );
    }

    /// @notice Determines whether `_operator` is an operator for all partitions of `_tokenHolder`
    /// @param _operator The operator to check
    /// @param _tokenHolder The token holder to check
    /// @return Whether the `_operator` is an operator for all partitions of `_tokenHolder`
    function isOperator(
        address _operator,
        address _tokenHolder
    ) public view virtual override returns (bool) {
        return _isOperator(_operator, _tokenHolder);
    }

    /// @notice Determines whether `_operator` is an operator for a specified partition of `_tokenHolder`
    /// @param _partition The partition to check
    /// @param _operator The operator to check
    /// @param _tokenHolder The token holder to check
    /// @return Whether the `_operator` is an operator for a specified partition of `_tokenHolder`
    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) public view virtual override returns (bool) {
        return _isOperatorForPartition(_partition, _operator, _tokenHolder);
    }
}
