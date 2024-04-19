pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {ICap} from '../interfaces/cap/ICap.sol';
import {_CAP_ROLE} from '../constants/roles.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_CAP_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {Common} from '../common/Common.sol';
import {CapStorageWrapper} from './CapStorageWrapper.sol';

contract Cap is ICap, IStaticFunctionSelectors, Common, CapStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(
        uint256 maxSupply,
        PartitionCap[] calldata partitionCap
    )
        external
        virtual
        override
        onlyUninitialized(_capStorage().initialized)
        returns (bool success_)
    {
        CapDataStorage storage capStorage = _capStorage();

        capStorage.maxSupply = maxSupply;

        for (uint256 i = 0; i < partitionCap.length; i++) {
            capStorage.maxSupplyByPartition[
                partitionCap[i].partition
            ] = partitionCap[i].maxSupply;
        }

        capStorage.initialized = true;
        success_ = true;
    }

    function setMaxSupply(
        uint256 _maxSupply
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_CAP_ROLE)
        checkNewMaxSupply(_maxSupply)
        returns (bool success_)
    {
        _setMaxSupply(_maxSupply);
        success_ = true;
    }

    function setMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _maxSupply
    )
        external
        virtual
        override
        onlyUnpaused
        onlyRole(_CAP_ROLE)
        checkNewMaxSupplyForPartition(_partition, _maxSupply)
        returns (bool success_)
    {
        _setMaxSupplyByPartition(_partition, _maxSupply);
        success_ = true;
    }

    function getMaxSupply()
        external
        view
        virtual
        override
        returns (uint256 maxSupply_)
    {
        return _getMaxSupply();
    }

    function getMaxSupplyByPartition(
        bytes32 _partition
    ) external view virtual override returns (uint256 maxSupply_) {
        return _getMaxSupplyByPartition(_partition);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _CAP_RESOLVER_KEY;
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
        staticFunctionSelectors_[selectorIndex++] = this
            .initialize_Cap
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.setMaxSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .setMaxSupplyByPartition
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMaxSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getMaxSupplyByPartition
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
        staticInterfaceIds_[selectorsIndex++] = type(ICap).interfaceId;
    }
}
