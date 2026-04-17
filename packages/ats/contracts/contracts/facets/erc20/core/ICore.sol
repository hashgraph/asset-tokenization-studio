// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreTypes } from "./ICoreTypes.sol";
import { IERC20 } from "../../layer_1/ERC1400/ERC20/IERC20.sol";

/**
 * @title ICore
 * @notice Core facet interface for token metadata and initialization
 * @dev Combines read operations and write operations for token core functionality
 * @author Asset Tokenization Studio Team
 */
interface ICore is ICoreTypes {
    /**
     * @notice Initializes Core facet with ERC20 metadata (only once)
     * @param erc20Metadata ERC20 metadata to initialize with
     */
    function initializeCore(IERC20.ERC20Metadata calldata erc20Metadata) external;

    /**
     * @notice Sets token name (requires TREX_OWNER_ROLE)
     * @param _name New token name
     */
    function setName(string calldata _name) external;

    /**
     * @notice Sets token symbol (requires TREX_OWNER_ROLE)
     * @param _symbol New token symbol
     */
    function setSymbol(string calldata _symbol) external;

    /**
     * @notice Returns token name
     * @return Token name string
     */
    function name() external view returns (string memory);

    /**
     * @notice Returns token symbol
     * @return Token symbol string
     */
    function symbol() external view returns (string memory);

    /**
     * @notice Returns token decimals
     * @return Token decimals value
     */
    function decimals() external view returns (uint8);

    /**
     * @notice Returns full ERC20 metadata (name, symbol, decimals)
     * @return ERC20 metadata structure adjusted for current timestamp
     */
    function getERC20Metadata() external view returns (IERC20.ERC20Metadata memory);

    /**
     * @notice Returns token version
     * @return Version string
     */
    function version() external view returns (string memory);
}
