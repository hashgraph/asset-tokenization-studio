// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Core
bytes32 constant RESOLVER_KEY_CORE = 0xb54e0c9a42346a2760a44e59035a2b84a61d07bed66a2f24cffe3ca4bae1996f;

/**
 * @title ICore
 * @author Asset Tokenization Studio Team
 * @notice Consolidated interface for the token "Core" domain: identity-defining methods
 *         (ERC20 metadata readers, ERC3643 name/symbol setters, and version).
 *         Also owns the `ERC20Metadata` struct, since the only initializer for this
 *         data (`initializeCore`) lives in CoreFacet.
 */
interface ICore {
    /**
     * @notice Basic ERC-20 token identity fields.
     */
    struct ERC20Metadata {
        string name;
        string symbol;
        uint8 decimals;
    }

    /**
     * @notice Emitted once when the core ERC-20 metadata is initialised on a token.
     * @dev Fires exclusively from `initializeCore` after the storage write succeeds.
     * @param metadata The ERC-20 metadata persisted at initialisation.
     */
    event CoreInitialized(ERC20Metadata metadata);

    /**
     * @notice Initializes the Core domain (name, symbol and decimals).
     * @param _metadata The ERC-20 metadata to persist.
     */
    function initializeCore(ERC20Metadata calldata _metadata) external;

    /**
     * @notice Updates the token name. Restricted to the TREX owner role.
     * @param _name New name to assign to the token.
     */
    function setName(string calldata _name) external;

    /**
     * @notice Updates the token symbol. Restricted to the TREX owner role.
     * @param _symbol New symbol to assign to the token.
     */
    function setSymbol(string calldata _symbol) external;

    /**
     * @notice Returns the decimals simulating non-triggered decimal adjustments up until current timestamp.
     * @return The number of decimals used for token amounts.
     */
    function decimals() external view returns (uint8);

    /**
     * @notice Returns the name of the security token.
     * @return The token name string.
     */
    function name() external view returns (string memory);

    /**
     * @notice Returns the symbol of the security token.
     * @return The token symbol string.
     */
    function symbol() external view returns (string memory);

    /**
     * @notice Returns the full metadata struct of the security token.
     * @return The persisted `ERC20Metadata`.
     */
    function getERC20Metadata() external view returns (ERC20Metadata memory);

    /**
     * @notice Returns the ERC3643 version string of the token.
     * @return The version string (e.g. `"4.0.0"`).
     */
    function version() external view returns (string memory);
}
