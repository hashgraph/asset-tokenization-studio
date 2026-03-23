// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";
import { ERC20VotesStorageWrapper } from "../../domain/asset/ERC20VotesStorageWrapper.sol";

/**
 * @title ERC20Modifiers
 * @notice Abstract contract providing ERC20 and ERC20Votes-related modifiers
 * @dev Provides modifiers for ERC20 state validation using _check* pattern
 *      from ERC20StorageWrapper and ERC20VotesStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract ERC20Modifiers {
    /**
     * @notice Modifier to ensure ERC20 has not been initialized
     * @dev Reverts with AlreadyInitialized if ERC20 is already initialized
     */
    modifier onlyNotERC20Initialized() {
        ERC20StorageWrapper._checkNotERC20Initialized();
        _;
    }

    /**
     * @notice Modifier to ensure ERC20Votes has not been initialized
     * @dev Reverts with AlreadyInitialized if ERC20Votes is already initialized
     */
    modifier onlyNotERC20VotesInitialized() {
        ERC20VotesStorageWrapper._checkNotERC20VotesInitialized();
        _;
    }
}
