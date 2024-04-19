// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {_ERC1644_STORAGE_POSITION} from '../../constants/storagePositions.sol';
import {
    IERC1644StorageWrapper
} from '../../interfaces/ERC1400/IERC1644StorageWrapper.sol';
import {ERC20StorageWrapper} from '../ERC20/ERC20StorageWrapper.sol';

abstract contract ERC1644StorageWrapper is
    ERC20StorageWrapper,
    IERC1644StorageWrapper
{
    struct ERC1644Storage {
        bool isControllable;
        bool initialized;
    }

    modifier onlyControllable() {
        if (!_isControllable()) {
            revert TokenIsNotControllable();
        }
        _;
    }

    function _controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) internal {
        _transfer(_from, _to, _value);
        emit ControllerTransfer(
            msg.sender,
            _from,
            _to,
            _value,
            _data,
            _operatorData
        );
    }

    function _controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) internal {
        _burn(_tokenHolder, _value);
        emit ControllerRedemption(
            msg.sender,
            _tokenHolder,
            _value,
            _data,
            _operatorData
        );
    }

    /**
     * @notice It is used to end the controller feature from the token
     * @dev It only be called by the `owner/issuer` of the token
     */
    function _finalizeControllable() internal {
        if (!_getErc1644Storage().isControllable) return;

        _getErc1644Storage().isControllable = false;
        emit FinalizedControllerFeature(_msgSender());
    }

    /**
     * @notice Internal function to know whether the controller functionality
     * allowed or not.
     * @return bool `true` when controller address is non-zero otherwise return `false`.
     */
    function _isControllable() internal view returns (bool) {
        return _getErc1644Storage().isControllable;
    }

    function _getErc1644Storage()
        internal
        pure
        returns (ERC1644Storage storage erc1644Storage_)
    {
        bytes32 position = _ERC1644_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1644Storage_.slot := position
        }
    }
}
