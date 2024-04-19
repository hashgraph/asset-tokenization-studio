// SPDX-License-Identifier: MIT
// Contract copy-pasted form OZ and extended

pragma solidity 0.8.18;

import {
    ERC1410SnapshotStorageWrapper
} from '../../../layer_1/ERC1400/ERC1410/ERC1410SnapshotStorageWrapper.sol';
import {
    CorporateActionsStorageWrapperSecurity
} from '../../corporateActions/CorporateActionsStorageWrapperSecurity.sol';

abstract contract ERC1410ScheduledSnapshotStorageWrapper is
    ERC1410SnapshotStorageWrapper,
    CorporateActionsStorageWrapperSecurity
{
    function _beforeTokenTransfer(
        bytes32 partition,
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        _triggerScheduledSnapshots(0);

        super._beforeTokenTransfer(partition, from, to, amount);
    }
}
