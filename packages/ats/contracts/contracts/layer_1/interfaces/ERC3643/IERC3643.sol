// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import {IERC3643StorageWrapper} from './IERC3643StorageWrapper.sol';
import {IERC3643Operations} from './IERC3643Operations.sol';
import {IERC3643Management} from './IERC3643Management.sol';
import {IERC3643Read} from './IERC3643Read.sol';
import {IERC3643Batch} from './IERC3643Batch.sol';

// solhint-disable no-empty-blocks
/**
 * @title IERC3643
 * @dev Unified interface for ERC3643 functionality combining all facets.
 * This interface provides external access to all ERC3643 functions through the Diamond pattern,
 * enabling interaction with all ERC3643 functions from external calls, tests, and SDK.
 * This interface is NOT meant to be inherited by any contract - it's only for external interaction.
 */
interface IERC3643 is
    IERC3643StorageWrapper,
    IERC3643Operations,
    IERC3643Management,
    IERC3643Read,
    IERC3643Batch
{
    // This interface combines all ERC3643 facets for external access
}
