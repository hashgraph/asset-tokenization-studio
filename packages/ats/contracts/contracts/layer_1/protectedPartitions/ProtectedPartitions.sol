pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {Common} from '../common/Common.sol';
import {
    IProtectedPartitions
} from '../interfaces/protectedPartitions/IProtectedPartitions.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {
    _PROTECTED_PARTITIONS_RESOLVER_KEY
} from '../constants/resolverKeys.sol';
import {
    _CONTRACT_NAME_PROTECTEDPARTITIONS,
    _CONTRACT_VERSION_PROTECTEDPARTITIONS
} from '../constants/values.sol';
import {_PROTECTED_PARTITIONS_ROLE} from '../constants/roles.sol';

contract ProtectedPartitions is
    IProtectedPartitions,
    IStaticFunctionSelectors,
    Common
{
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(
        bool _protectPartitions
    )
        external
        override
        onlyUninitialized(_protectedPartitionsStorage().initialized)
        returns (bool success_)
    {
        ProtectedPartitionsDataStorage
            storage protectedPartitionsStorage = _protectedPartitionsStorage();
        protectedPartitionsStorage.arePartitionsProtected = _protectPartitions;
        protectedPartitionsStorage
            .contractName = _CONTRACT_NAME_PROTECTEDPARTITIONS;
        protectedPartitionsStorage
            .contractVersion = _CONTRACT_VERSION_PROTECTEDPARTITIONS;
        protectedPartitionsStorage.initialized = true;
        success_ = true;
    }

    function protectPartitions()
        external
        override
        onlyUnpaused
        onlyRole(_PROTECTED_PARTITIONS_ROLE)
        returns (bool success_)
    {
        _setProtectedPartitions(true);
        success_ = true;
    }

    function unprotectPartitions()
        external
        override
        onlyUnpaused
        onlyRole(_PROTECTED_PARTITIONS_ROLE)
        returns (bool success_)
    {
        _setProtectedPartitions(false);
        success_ = true;
    }

    function arePartitionsProtected() external view override returns (bool) {
        return _arePartitionsProtected();
    }

    function getNounceFor(
        address account
    ) external view override returns (uint256) {
        return _getNounceFor(account);
    }

    function calculateRoleForPartition(
        bytes32 partition
    ) external pure override returns (bytes32 role) {
        role = _calculateRoleForPartition(partition);
    }

    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _PROTECTED_PARTITIONS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](6);
        staticFunctionSelectors_[selectorIndex++] = this
            .initialize_ProtectedPartitions
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .protectPartitions
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .unprotectPartitions
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .arePartitionsProtected
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNounceFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .calculateRoleForPartition
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IProtectedPartitions)
            .interfaceId;
    }
}
