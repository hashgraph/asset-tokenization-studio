// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BasicTransferInfo } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { ERC1644StorageWrapper } from "../ERC1644/ERC1644StorageWrapper.sol";
import { checkNounceAndDeadline } from "../../../layer_1/protectedPartitions/signatureVerification.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../layer_1/interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol";

abstract contract ERC1410ProtectedPartitionsStorageWrapper is ERC1644StorageWrapper {
    function _protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal returns (bytes32) {
        checkNounceAndDeadline(
            _protectionData.nounce,
            _from,
            _getNounceFor(_from),
            _protectionData.deadline,
            _blockTimestamp()
        );

        _checkTransferSignature(_partition, _from, _to, _amount, _protectionData);

        _setNounce(_protectionData.nounce, _from);

        return _transferByPartition(_from, BasicTransferInfo(_to, _amount), _partition, "", _msgSender(), "");
    }

    function _protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal {
        checkNounceAndDeadline(
            _protectionData.nounce,
            _from,
            _getNounceFor(_from),
            _protectionData.deadline,
            _blockTimestamp()
        );

        _checkRedeemSignature(_partition, _from, _amount, _protectionData);
        _setNounce(_protectionData.nounce, _from);

        _redeemByPartition(_partition, _from, _msgSender(), _amount, "", "");
    }
}
