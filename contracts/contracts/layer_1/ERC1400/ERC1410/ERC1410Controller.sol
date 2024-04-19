// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    ERC1410ControllerStorageWrapper
} from './ERC1410ControllerStorageWrapper.sol';
import {_CONTROLLER_ROLE} from '../../constants/roles.sol';
import {
    IERC1410Controller
} from '../../interfaces/ERC1400/IERC1410Controller.sol';

abstract contract ERC1410Controller is
    IERC1410Controller,
    ERC1410ControllerStorageWrapper
{
    function controllerTransferByPartition(
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
        onlyRole(_CONTROLLER_ROLE)
        onlyControllable
    {
        _transferByPartition(
            _from,
            _to,
            _value,
            _partition,
            _data,
            _msgSender(),
            _operatorData
        );
    }

    function controllerRedeemByPartition(
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
        onlyRole(_CONTROLLER_ROLE)
        onlyControllable
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

    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view virtual override returns (bool, bytes1, bytes32) {
        return
            _canTransferByPartition(
                _from,
                _to,
                _partition,
                _value,
                _data,
                _operatorData
            );
    }
}
