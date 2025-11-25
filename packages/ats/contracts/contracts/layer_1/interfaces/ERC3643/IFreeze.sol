// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IFreeze {
    /**
     *  @notice This event is emitted when a certain amount of tokens is frozen on a wallet
     */
    event TokensFrozen(address indexed account, uint256 amount, bytes32 partition);

    /**
     *  @notice This event is emitted when a certain amount of tokens is unfrozen on a wallet
     */
    event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition);

    /**
     *  @dev This event is emitted when the wallet of an investor is frozen or unfrozen
     *  @dev The event is emitted by setAddressFrozen and batchSetAddressFrozen functions
     *  @param userAddress Is the wallet of the investor that is concerned by the freezing status
     *  @param isFrozen Is the freezing status of the wallet
     *  @param owner Is the address of the agent who called the function to freeze the wallet
     */
    event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner);

    /*
     * @dev Freezes a partial amount of the user's tokens across all partitions.
     * Emits a TokensFrozen event.
     */
    function freezePartialTokens(address _userAddress, uint256 _amount) external;

    /*
     * @dev Unfreezes a partial amount of the user's previously frozen tokens across all partitions.
     * Emits a TokensUnfrozen event.
     */
    function unfreezePartialTokens(address _userAddress, uint256 _amount) external;

    /*
     * @dev Freezes the user's address entirely, disabling all token operations.
     * Emits a TokensFrozen event.
     */
    function setAddressFrozen(address _userAddress, bool _freezeStatus) external;

    /*
     * @dev Returns the total amount of tokens currently frozen for the given user across all partitions.
     */
    function getFrozenTokens(address _userAddress) external view returns (uint256);
}
