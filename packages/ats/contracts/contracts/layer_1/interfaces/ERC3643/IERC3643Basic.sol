// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC3643Management {
    struct ERC3643Storage {
        address onchainID;
        address identityRegistry;
        address compliance;
        mapping(address => uint256) frozenTokens;
        mapping(address => mapping(bytes32 => uint256)) frozenTokensByPartition;
        mapping(address => bool) addressRecovered;
        bool initialized;
    }

    /**
     *  @notice This event is emitted when the token information is updated.
     */
    event UpdatedTokenInformation(
        string indexed newName,
        string indexed newSymbol,
        uint8 newDecimals,
        string newVersion,
        address indexed newOnchainID
    );

    /**
     *  @notice This event is emitted when the IdentityRegistry has been set for the token
     */
    event IdentityRegistryAdded(address indexed identityRegistry);

    /**
     * @dev Emitted when the agent role is granted
     *
     * @param _agent Address of the agent that has been added
     */
    event AgentAdded(address indexed _agent);

    /**
     * @dev Emitted when the agent role is revoked
     *
     * @param _agent Address of the agent that has been removed
     */
    event AgentRemoved(address indexed _agent);

    /**
     * @dev Emitted when a wallet is recovered
     *
     * @param _lostWallet Address of the lost wallet
     * @param _newWallet Address of the new wallet
     * @param _investorOnchainID OnchainID
     */
    event RecoverySuccess(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    );

    /**
     * @notice Thrown when calling from a recovered wallet
     */
    error WalletRecovered();

    /**
     * @notice Thrown when attempting to recover a wallet with pending locks, holds or clearings
     */
    error CannotRecoverWallet();

    /**
     * @notice Thrown in batch operations when input amount arrays length is different
     */
    error InputAmountsArrayLengthMismatch();

    /**
     * @notice Thrown in batch operations when input boolean arrays length is different
     */
    error InputBoolArrayLengthMismatch();

    /**
     * @notice Thrown when the calls to the methods in the compliance contract fail
     */
    error ComplianceCallFailed();

    /**
     * @notice Thrown when the compliance contract returns false
     */
    error ComplianceNotAllowed();

    /**
     * @notice Thrown when the calls to the methods in the identity contract fail
     */
    error IdentityRegistryCallFailed();

    /**
     * @notice Thrown when the identity contract returns false
     */
    error AddressNotVerified();

    /**
     * @dev Facet initializer
     *
     * Sets the compliance contract address
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(
        address _compliance,
        address _identityRegistry
    ) external;

    /**
     * @dev Sets the name of the token to `_name`.
     *
     * Emits an UpdatedTokenInformation event.
     */
    function setName(string calldata _name) external;

    /**
     * @dev Sets the symbol of the token to `_symbol`.
     *
     * Emits an UpdatedTokenInformation event.
     */
    function setSymbol(string calldata _symbol) external;

    /**
     * @dev Sets the onchainID of the token to `_onchainID`.
     * @dev Performs a forced transfer of `_amount` tokens from `_from` to `_to`.
     *
     * This function should only be callable by an authorized entities
     *
     * Returns `true` if the transfer was successful.
     *
     * Emits an UpdatedTokenInformation event.
     */
    function setOnchainID(address _onchainID) external;

    /**
     * @dev Sets the identity registry contract address.
     * @dev Mints `_amount` tokens to the address `_to`.
     *
     * Emits an IdentityRegistryAdded event.
     */
    function setIdentityRegistry(address _identityRegistry) external;

    /**
     * @dev Sets the compliance contract address.
     * @dev Burns `_amount` tokens from the address `_userAddress`.
     *
     * Reduces total supply.
     *
     * Emits a ComplianceAdded event.
     */
    function setCompliance(address _compliance) external;

    /**
     * @notice Gives an account the agent role
     * @notice Granting an agent role allows the account to perform multiple ERC-1400 actions
     * @dev Can only be called by the role admin
     */
    function addAgent(address _agent) external;

    /**
     * @notice Revokes an account the agent role
     * @dev Can only be called by the role admin
     */
    function removeAgent(address _agent) external;

    /**
     * @notice Transfers the status of a lost wallet to a new wallet
     * @dev Can only be called by the agent
     */
    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) external returns (bool);
}
