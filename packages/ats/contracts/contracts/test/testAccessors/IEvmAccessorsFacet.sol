// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @custom:hash resolverKey EvmAccessors
 * @dev Hardcoded rather than codegen-stamped because the hash codegen skips
 *      `contracts/test/**`. Value = keccak256("asset.tokenization.standard.resolverKey.EvmAccessors").
 */
bytes32 constant RESOLVER_KEY_EVM_ACCESSORS = 0xc9277967ed8c5620626744261629ddd9fabe3126fecde242db9be85d8084257b;

/**
 * @title EVM Accessors Facet interface
 * @author Asset Tokenization Studio Team
 * @notice Test-only writer interface that pokes the EvmAccessors override slots for
 *         `block.timestamp`, `block.number`, `msg.sender`, and `block.chainid`.
 *         Production diamonds must never register this facet — selectors are only
 *         resolvable when the contracts are compiled with `ATS_TEST_MODE=true`.
 */
interface IEvmAccessorsFacet {
    /**
     * @notice Emitted when the overridden system timestamp is changed.
     * @param legacySystemTime The previous override value (0 when none was set).
     * @param newSystemTime The new override value.
     */
    event SystemTimestampChanged(uint256 legacySystemTime, uint256 newSystemTime);

    /// @notice Emitted when the system timestamp override is cleared.
    event SystemTimestampReset();

    /**
     * @notice Emitted when the overridden system block number is changed.
     * @param legacySystemNumber The previous override value (0 when none was set).
     * @param newSystemNumber The new override value.
     */
    event SystemBlockNumberChanged(uint256 legacySystemNumber, uint256 newSystemNumber);

    /// @notice Emitted when the system block number override is cleared.
    event SystemBlockNumberReset();

    /**
     * @notice Emitted when the overridden chain id is changed.
     * @param oldChainId The previous override value (0 when none was set).
     * @param newChainId The new override value.
     */
    event SystemChainIdChanged(uint256 oldChainId, uint256 newChainId);

    /// @notice Emitted when the chain id override is cleared.
    event SystemChainIdReset();

    /**
     * @notice Emitted when the overridden message sender is changed.
     * @param oldSender The previous override value (the zero address when none was set).
     * @param newSender The new override value.
     */
    event SystemSenderChanged(address oldSender, address newSender);

    /// @notice Emitted when the message sender override is cleared.
    event SystemSenderReset();

    /// @notice Emitted when the facet is marked ready in the centralised initializer.
    event EvmAccessorsInitialized();

    /// @notice Thrown when the resolved chain id does not match the expected value.
    error WrongChainId();

    /**
     * @notice Thrown when setting a zero system block number.
     * @param newSystemNumber The rejected block number.
     */
    error InvalidBlockNumber(uint256 newSystemNumber);

    /**
     * @notice Thrown when setting a zero chain id.
     * @param chainId The rejected chain id.
     */
    error InvalidChainId(uint256 chainId);

    /**
     * @notice Thrown when setting the zero address as the sender override (it is the sentinel).
     * @param sender The rejected sender address.
     */
    error InvalidSender(address sender);

    /**
     * @notice Marks the facet ready in the centralised initializer so a token that
     *         registers it reaches operational status. Reverts if already registered.
     * @dev Called once per deployed security — by the test factory immediately after
     *      deployment, or directly by the deployer in direct-deploy fixtures.
     */
    function initializeEvmAccessors() external;

    /**
     * @notice Overrides the timestamp returned by `EvmAccessors.getBlockTimestamp`.
     * @param _newSystemTime The new override timestamp.
     */
    function changeSystemTimestamp(uint256 _newSystemTime) external;

    /// @notice Clears the timestamp override, restoring `block.timestamp`.
    function resetSystemTimestamp() external;

    /**
     * @notice Overrides the block number returned by `EvmAccessors.getBlockNumber`.
     * @param _newSystemBlockNumber The new override block number.
     */
    function changeSystemBlockNumber(uint256 _newSystemBlockNumber) external;

    /// @notice Clears the block number override, restoring `block.number`.
    function resetSystemBlockNumber() external;

    /**
     * @notice Overrides the chain id returned by `EvmAccessors.getChainId`.
     * @param _newChainId The new override chain id.
     */
    function changeSystemChainId(uint256 _newChainId) external;

    /// @notice Clears the chain id override, restoring `block.chainid`.
    function resetSystemChainId() external;

    /**
     * @notice Overrides the sender returned by `EvmAccessors.getMsgSender`.
     * @dev The override is global storage applied to every read on the diamond; prefer
     *      Hardhat impersonation for ordinary per-call sender control. Reverts on the
     *      zero address (the override sentinel) — use `resetSystemSender` to clear.
     * @param _newSender The new override sender.
     */
    function changeSystemSender(address _newSender) external;

    /// @notice Clears the sender override, restoring `msg.sender`.
    function resetSystemSender() external;

    /**
     * @notice Returns the currently resolved system timestamp (override or native).
     * @return The active timestamp — the override when set, otherwise `block.timestamp`.
     */
    function blockTimestamp() external view returns (uint256);
}
