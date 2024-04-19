// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    SnapshotsStorageWrapper
} from '../../snapshots/SnapshotsStorageWrapper.sol';

abstract contract ERC1410SnapshotStorageWrapper is SnapshotsStorageWrapper {
    function _beforeTokenTransfer(
        bytes32 partition,
        address from,
        address to,
        uint256 amount // solhint-disable-line no-unused-vars
    ) internal virtual override {
        if (from == address(0)) {
            // mint
            _updateAccountSnapshot(to, partition);
            _updateTotalSupplySnapshot();
        } else if (to == address(0)) {
            // burn
            _updateAccountSnapshot(from, partition);
            _updateTotalSupplySnapshot();
        } else {
            // transfer
            _updateAccountSnapshot(from, partition);
            _updateAccountSnapshot(to, partition);
        }
    }
}
