// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IERC1410Standard} from '../../interfaces/ERC1400/IERC1410Standard.sol';
import {
    ERC1410StandardStorageWrapper
} from './ERC1410StandardStorageWrapper.sol';
import {_ISSUER_ROLE} from '../../constants/roles.sol';
import {CapStorageWrapper} from '../../cap/CapStorageWrapper.sol';

abstract contract ERC1410Standard is
    IERC1410Standard,
    ERC1410StandardStorageWrapper,
    CapStorageWrapper
{
    /// @notice Increases totalSupply and the corresponding amount of the specified owners partition
    /// @param _partition The partition to allocate the increase in balance
    /// @param _tokenHolder The token holder whose balance should be increased
    /// @param _value The amount by which to increase the balance
    /// @param _data Additional data attached to the minting of tokens
    function issueByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    )
        external
        virtual
        override
        checkMaxSupply(_value)
        checkMaxSupplyForPartition(_partition, _value)
        onlyValidAddress(_tokenHolder)
        checkControlList(_tokenHolder)
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyRole(_ISSUER_ROLE)
    {
        _issueByPartition(_partition, _tokenHolder, _value, _data);
    }

    /// @notice Decreases totalSupply and the corresponding amount of the specified partition of _msgSender()
    /// @param _partition The partition to allocate the decrease in balance
    /// @param _value The amount by which to decrease the balance
    /// @param _data Additional data attached to the burning of tokens
    function redeemByPartition(
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    )
        external
        virtual
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        checkControlList(_msgSender())
    {
        // Add the function to validate the `_data` parameter
        _redeemByPartition(
            _partition,
            _msgSender(),
            address(0),
            _value,
            _data,
            ''
        );
    }

    /// @notice Decreases totalSupply and the corresponding amount of the specified partition of tokenHolder
    /// @dev This function can only be called by the authorised operator.
    /// @param _partition The partition to allocate the decrease in balance.
    /// @param _tokenHolder The token holder whose balance should be decreased
    /// @param _value The amount by which to decrease the balance
    /// @param _data Additional data attached to the burning of tokens
    /// @param _operatorData Additional data attached to the transfer of tokens by the operator
    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        virtual
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        checkControlList(_tokenHolder)
        checkControlList(_msgSender())
        onlyOperator(_partition, _tokenHolder)
    {
        _redeemByPartition(
            _partition,
            _tokenHolder,
            _msgSender(),
            _value,
            _data,
            _operatorData
        );
    }

    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view virtual override returns (bool, bytes1, bytes32) {
        return
            _canRedeemByPartition(
                _from,
                _partition,
                _value,
                _data,
                _operatorData
            );
    }
}
