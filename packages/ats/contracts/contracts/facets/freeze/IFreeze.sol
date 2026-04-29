// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IFreeze
 * @notice Interface for freezing and unfreezing addresses and tokens
 * @dev Provides standard ERC-1400 freezing functionality with batch operations
 */
interface IFreeze {
    /**
     * @notice Emitted when a certain amount of tokens is frozen on a wallet
     * @param account The wallet address where tokens were frozen
     * @param amount The amount of tokens frozen
     * @param partition The partition identifier (default partition for single partition)
     */
    event TokensFrozen(address indexed account, uint256 amount, bytes32 partition);

    /**
     * @notice Emitted when a certain amount of tokens is unfrozen on a wallet
     * @param account The wallet address where tokens were unfrozen
     * @param amount The amount of tokens unfrozen
     * @param partition The partition identifier (default partition for single partition)
     */
    event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition);

    /**
     * @notice Emitted when a wallet's frozen status changes
     * @param userAddress The wallet address that was frozen/unfrozen
     * @param isFrozen The new freeze status (true = frozen, false = unfrozen)
     * @param owner The address of the agent who triggered the freeze
     */
    event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner);

    /**
     * @notice Freezes a partial amount of the user's tokens across all partitions
     * @param _userAddress The address to freeze tokens for
     * @param _amount The amount of tokens to freeze
     * @dev Emits a TokensFrozen event
     */
    function freezePartialTokens(address _userAddress, uint256 _amount) external;

    /**
     * @notice Unfreezes a partial amount of the user's previously frozen tokens
     * @param _userAddress The address to unfreeze tokens for
     * @param _amount The amount of tokens to unfreeze
     * @dev Emits a TokensUnfrozen event
     */
    function unfreezePartialTokens(address _userAddress, uint256 _amount) external;

    /**
     * @notice Freezes or unfreezes a user's address entirely
     * @param _userAddress The address to freeze/unfreeze
     * @param _freezeStatus True to freeze, false to unfreeze
     * @dev Emits an AddressFrozen event
     * @dev When frozen, the address cannot perform any token operations
     */
    function setAddressFrozen(address _userAddress, bool _freezeStatus) external;

    /**
     * @notice Returns the total amount of tokens currently frozen for a user
     * @param _userAddress The address to query
     * @return The total frozen token amount across all partitions
     */
    function getFrozenTokens(address _userAddress) external view returns (uint256);
}
