// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643 } from "../../facets/layer_1/ERC3643/IERC3643.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";

/**
 * @title ERC3643Modifiers
 * @dev Abstract contract providing ERC3643-specific modifiers
 *
 * This contract wraps ERC3643StorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping ERC3643StorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to ERC3643 modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract ERC3643Modifiers {
    /**
     * @dev Modifier that validates address is not recovered
     *
     * Requirements:
     * - Address must not be in recovered state (for security token compliance)
     *
     * @param _account The address to validate
     */
    modifier onlyUnrecoveredAddress(address _account) {
        ERC3643StorageWrapper.requireUnrecoveredAddress(_account);
        _;
    }

    /**
     * @dev Modifier that validates wallet is empty
     *
     * Requirements:
     * - Token holder must have zero balance across all partitions
     *
     * @param _tokenHolder The token holder address to check
     */
    modifier onlyEmptyWallet(address _tokenHolder) {
        ERC3643StorageWrapper.requireEmptyWallet(_tokenHolder);
        _;
    }

    /**
     * @dev Modifier that validates input amounts array length matches addresses array
     *
     * Requirements:
     * - _amounts.length must equal _addresses.length
     *
     * @param _addresses Array of addresses
     * @param _amounts Array of amounts corresponding to addresses
     */
    modifier onlyValidInputAmountsArrayLength(address[] memory _addresses, uint256[] memory _amounts) {
        ERC3643StorageWrapper.requireValidInputAmountsArrayLength(_addresses, _amounts);
        _;
    }

    /**
     * @dev Modifier that validates input bool array length matches addresses array
     *
     * Requirements:
     * - _status.length must equal _addresses.length
     *
     * @param _addresses Array of addresses
     * @param _status Array of boolean status values corresponding to addresses
     */
    modifier onlyValidInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) {
        ERC3643StorageWrapper.requireValidInputBoolArrayLength(_addresses, _status);
        _;
    }
}
