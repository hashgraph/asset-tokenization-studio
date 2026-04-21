// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "../layer_1/ERC1400/ERC20/IERC20.sol";

/**
 * @title ICore
 * @notice Consolidated interface for the token "Core" domain: identity-defining methods
 *         (ERC20 metadata readers, ERC3643 name/symbol setters, and version).
 */
interface ICore {
    /**
     * @notice Initializes the Core domain (name, symbol, decimals and the rest of the ERC20 metadata).
     * @dev Writes into the same storage as `initialize_ERC20`; only one of the two may run.
     */
    function initializeCore(IERC20.ERC20Metadata calldata metadata) external;

    /**
     * @notice Updates the token name. Restricted to the TREX owner role.
     */
    function setName(string calldata _name) external;

    /**
     * @notice Updates the token symbol. Restricted to the TREX owner role.
     */
    function setSymbol(string calldata _symbol) external;

    /**
     * @notice Returns the decimals simulating non-triggered decimal adjustments up until current timestamp.
     */
    function decimals() external view returns (uint8);

    /**
     * @notice Returns the name of the security token.
     */
    function name() external view returns (string memory);

    /**
     * @notice Returns the symbol of the security token.
     */
    function symbol() external view returns (string memory);

    /**
     * @notice Returns the full metadata struct of the security token.
     */
    function getERC20Metadata() external view returns (IERC20.ERC20Metadata memory);

    /**
     * @notice Returns the ERC3643 version string of the token.
     */
    function version() external view returns (string memory);
}
