// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchFreeze } from "./IBatchFreeze.sol";
import { IFreeze } from "../layer_1/freeze/IFreeze.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ExternalListManagementStorageWrapper } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title BatchFreeze
 * @notice Abstract implementation of `IBatchFreeze` that batch-freezes and batch-unfreezes
 *         addresses and partial token amounts in a single call.
 * @dev Delegates all storage mutations to `ERC3643StorageWrapper`. Only works in
 *      single-partition mode. Intended to be inherited by `BatchFreezeFacet`.
 */
abstract contract BatchFreeze is IBatchFreeze, Modifiers {
    /// @inheritdoc IBatchFreeze
    function batchSetAddressFrozen(
        address[] calldata _userAddresses,
        bool[] calldata _freeze
    )
        external
        onlyUnpaused
        onlyValidInputBoolArrayLength(_userAddresses, _freeze)
        onlyFreezeRoles(EvmAccessors.getMsgSender())
    {
        uint256 length = _userAddresses.length;
        address sender = EvmAccessors.getMsgSender();
        for (uint256 i; i < length; ) {
            ExternalListManagementStorageWrapper.checkValidAddress(_userAddresses[i]);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.setAddressFrozen(_userAddresses[i], _freeze[i]);
            emit IFreeze.AddressFrozen(_userAddresses[i], _freeze[i], sender);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IBatchFreeze
    function batchFreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    ) external onlyUnpaused onlyValidInputAmountsArrayLength(_userAddresses, _amounts) onlyWithoutMultiPartition {
        uint256 length = _userAddresses.length;
        for (uint256 i; i < length; ) {
            ERC1410StorageWrapper.requireValidAddress(_userAddresses[i]);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.freezeTokens(_userAddresses[i], _amounts[i]);
            emit IFreeze.TokensFrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IBatchFreeze
    function batchUnfreezePartialTokens(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    ) external onlyUnpaused onlyValidInputAmountsArrayLength(_userAddresses, _amounts) onlyWithoutMultiPartition {
        uint256 length = _userAddresses.length;
        for (uint256 i; i < length; ) {
            ERC1410StorageWrapper.requireValidAddress(_userAddresses[i]);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_userAddresses[i]);
            ERC3643StorageWrapper.unfreezeTokens(_userAddresses[i], _amounts[i], 0);
            emit IFreeze.TokensUnfrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
            unchecked {
                ++i;
            }
        }
    }
}
