// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BasicTransferInfo } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { ERC1644StorageWrapper } from "../ERC1644/ERC1644StorageWrapper.sol";
import { checkNounceAndDeadline } from "../../../layer_1/protectedPartitions/signatureVerification.sol";

abstract contract ERC1410ProtectedPartitionsStorageWrapper is ERC1644StorageWrapper {
    function _protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) internal override {
        checkNounceAndDeadline(_nounce, _from, _getNounceFor(_from), _deadline, _blockTimestamp());

        _checkTransferSignature(_partition, _from, _to, _amount, _deadline, _nounce, _signature);

        _setNounce(_nounce, _from);

        _transferByPartition(_from, BasicTransferInfo(_to, _amount), _partition, "", _msgSender(), "");
    }

    function _protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) internal override {
        checkNounceAndDeadline(_nounce, _from, _getNounceFor(_from), _deadline, _blockTimestamp());

        _checkRedeemSignature(_partition, _from, _amount, _deadline, _nounce, _signature);
        _setNounce(_nounce, _from);

        _redeemByPartition(_partition, _from, _msgSender(), _amount, "", "");
    }
}
