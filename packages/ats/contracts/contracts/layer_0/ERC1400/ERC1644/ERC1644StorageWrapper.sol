// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1644_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC1644StorageWrapper } from "../../../layer_1/interfaces/ERC1400/IERC1644StorageWrapper.sol";
import { ERC3643StorageWrapper2 } from "../../ERC3643/ERC3643StorageWrapper2.sol";

abstract contract ERC1644StorageWrapper is IERC1644StorageWrapper, ERC3643StorageWrapper2 {
    struct ERC1644Storage {
        bool isControllable;
        bool initialized;
    }

    modifier onlyControllable() override {
        _checkControllable();
        _;
    }

    function _controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal override {
        _transfer(_from, _to, _value);
        emit ControllerTransfer(msg.sender, _from, _to, _value, _data, _operatorData);
    }

    function _controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal override {
        _burn(_tokenHolder, _value);
        emit ControllerRedemption(msg.sender, _tokenHolder, _value, _data, _operatorData);
    }

    function _finalizeControllable() internal override {
        if (!_erc1644Storage().isControllable) return;

        _erc1644Storage().isControllable = false;
        emit FinalizedControllerFeature(_msgSender());
    }

    function _isControllable() internal view override returns (bool) {
        return _erc1644Storage().isControllable;
    }

    function _erc1644Storage() internal pure returns (ERC1644Storage storage erc1644Storage_) {
        bytes32 position = _ERC1644_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1644Storage_.slot := position
        }
    }

    function _checkControllable() private view {
        if (!_isControllable()) revert TokenIsNotControllable();
    }
}
