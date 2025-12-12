// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { ICompliance } from "../../../layer_1/interfaces/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../../layer_1/interfaces/ERC3643/IERC3643Management.sol";
import { BasicTransferInfo } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { IERC1410StorageWrapper } from "../../../layer_1/interfaces/ERC1400/IERC1410StorageWrapper.sol";
import { ERC20StorageWrapper1 } from "../ERC20/ERC20StorageWrapper1.sol";
import { LowLevelCall } from "../../common/libraries/LowLevelCall.sol";

abstract contract ERC1410BasicStorageWrapper is IERC1410StorageWrapper, ERC20StorageWrapper1 {
    using LowLevelCall for address;

    function _transferByPartition(
        address _from,
        BasicTransferInfo memory _basicTransferInfo,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData
    ) internal returns (bytes32) {
        _beforeTokenTransfer(_partition, _from, _basicTransferInfo.to, _basicTransferInfo.value);

        _reduceBalanceByPartition(_from, _basicTransferInfo.value, _partition);

        // Emit transfer event.
        emit TransferByPartition(
            _partition,
            _operator,
            _from,
            _basicTransferInfo.to,
            _basicTransferInfo.value,
            _data,
            _operatorData
        );

        if (!_validPartitionForReceiver(_partition, _basicTransferInfo.to)) {
            _addPartitionTo(_basicTransferInfo.value, _basicTransferInfo.to, _partition);
        } else {
            _increaseBalanceByPartition(_basicTransferInfo.to, _basicTransferInfo.value, _partition);
        }

        if (_from != _basicTransferInfo.to && _partition == _DEFAULT_PARTITION) {
            (_erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(
                    ICompliance.transferred.selector,
                    _from,
                    _basicTransferInfo.to,
                    _basicTransferInfo.value
                ),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }

        _afterTokenTransfer(_partition, _from, _basicTransferInfo.to, _basicTransferInfo.value);

        return bytes32(0);
    }
}
