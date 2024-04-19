// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {ISnapshots} from '../interfaces/snapshots/ISnapshots.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_SNAPSHOTS_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {_SNAPSHOT_ROLE} from '../constants/roles.sol';
import {
    ERC1410SnapshotStorageWrapper
} from '../ERC1400/ERC1410/ERC1410SnapshotStorageWrapper.sol';

contract Snapshots is
    IStaticFunctionSelectors,
    ISnapshots,
    ERC1410SnapshotStorageWrapper
{
    function takeSnapshot()
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_SNAPSHOT_ROLE)
        returns (uint256 snapshotID)
    {
        return _takeSnapshot();
    }

    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view virtual override returns (uint256 balance_) {
        return _balanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view virtual override returns (uint256 balance_) {
        return
            _balanceOfAtSnapshotByPartition(
                _partition,
                _snapshotID,
                _tokenHolder
            );
    }

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view virtual override returns (bytes32[] memory) {
        return _partitionsOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function totalSupplyAtSnapshot(
        uint256 _snapshotID
    ) external view virtual override returns (uint256 totalSupply_) {
        return _totalSupplyAtSnapshot(_snapshotID);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _SNAPSHOTS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.takeSnapshot.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .balanceOfAtSnapshot
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .totalSupplyAtSnapshot
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .balanceOfAtSnapshotByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .partitionsOfAtSnapshot
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ISnapshots).interfaceId;
    }
}
