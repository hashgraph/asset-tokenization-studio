// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchFreeze, RESOLVER_KEY_BATCH_FREEZE } from "./IBatchFreeze.sol";
import { IFreezeTypes } from "../freeze/IFreezeTypes.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DefaultValueValidation } from "../../infrastructure/utils/DefaultValueValidation.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BatchFreeze
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IBatchFreeze` that batch-freezes and batch-unfreezes
 *         addresses and partial token amounts in a single call.
 * @dev Delegates all storage mutations to `ERC3643StorageWrapper`. Only works in
 *      single-partition mode. Intended to be inherited by `BatchFreezeFacet`.
 */
abstract contract BatchFreeze is IBatchFreeze, Modifiers {
    /// @inheritdoc IBatchFreeze
    function initializeBatchFreeze()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_BATCH_FREEZE)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_BATCH_FREEZE);
        emit IBatchFreeze.BatchFreezeInitialized();
    }

    /// @inheritdoc IBatchFreeze
    function batchSetAddressFrozen(
        address[] calldata _userAddresses,
        bool[] calldata _freeze
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyValidInputBoolArrayLength(_userAddresses, _freeze)
        onlyFreezeRoles(EvmAccessors.getMsgSender())
    {
        uint256 length = _userAddresses.length;
        address sender = EvmAccessors.getMsgSender();
        for (uint256 i; i < length; ) {
            DefaultValueValidation.checkZeroAddress(_userAddresses[i]);
            ERC3643StorageWrapper.checkUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.setAddressFrozen(_userAddresses[i], _freeze[i]);
            emit IFreezeTypes.AddressFrozen(_userAddresses[i], _freeze[i], sender);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IBatchFreeze
    function batchFreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_userAddresses, _amounts)
        onlyWithoutMultiPartition
        onlyFreezeRoles(EvmAccessors.getMsgSender())
    {
        uint256 length = _userAddresses.length;
        for (uint256 i; i < length; ) {
            DefaultValueValidation.checkZeroAddress(_userAddresses[i]);
            ERC3643StorageWrapper.checkUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.freezeTokens(_userAddresses[i], _amounts[i]);
            emit IFreezeTypes.TokensFrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IBatchFreeze
    function batchUnfreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_userAddresses, _amounts)
        onlyWithoutMultiPartition
        onlyFreezeRoles(EvmAccessors.getMsgSender())
    {
        uint256 length = _userAddresses.length;
        for (uint256 i; i < length; ) {
            DefaultValueValidation.checkZeroAddress(_userAddresses[i]);
            ERC3643StorageWrapper.checkUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.unfreezeTokens(_userAddresses[i], _amounts[i], 0);
            emit IFreezeTypes.TokensUnfrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
            unchecked {
                ++i;
            }
        }
    }
}
