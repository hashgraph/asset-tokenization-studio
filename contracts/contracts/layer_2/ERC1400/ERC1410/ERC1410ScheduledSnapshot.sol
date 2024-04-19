// SPDX-License-Identifier: MIT
// Contract copy-pasted form OZ and extended

pragma solidity 0.8.18;

import {
    ERC1410ScheduledSnapshotStorageWrapper
} from './ERC1410ScheduledSnapshotStorageWrapper.sol';
import {
    ERC1410Snapshot
} from '../../../layer_1/ERC1400/ERC1410/ERC1410Snapshot.sol';
import {
    ERC1410SnapshotStorageWrapper
} from '../../../layer_1/ERC1400/ERC1410/ERC1410SnapshotStorageWrapper.sol';
import {
    ERC1410BasicStorageWrapper
} from '../../../layer_1/ERC1400/ERC1410/ERC1410BasicStorageWrapper.sol';

contract ERC1410ScheduledSnapshot is
    ERC1410Snapshot,
    ERC1410ScheduledSnapshotStorageWrapper
{
    function _beforeTokenTransfer(
        bytes32 partition,
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(
            ERC1410BasicStorageWrapper,
            ERC1410ScheduledSnapshotStorageWrapper,
            ERC1410SnapshotStorageWrapper
        )
    {
        ERC1410ScheduledSnapshotStorageWrapper._beforeTokenTransfer(
            partition,
            from,
            to,
            amount
        );
    }
}
