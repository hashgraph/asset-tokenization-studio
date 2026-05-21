// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IOperator
 * @notice Interface for operator management: query, authorize and revoke operators for all partitions.
 */
interface IOperator {
    /**
     * @notice Emitted once when the operator capability is initialised on a token.
     * @dev Fires exclusively from `initializeOperator`.
     */
    event OperatorInitialized();

    /// @notice Emitted when an operator is authorized by an account for all partitions of the account
    /// @param operator The account that changed their delegation
    /// @param tokenHolder The account who authorized the operator
    event OperatorAuthorized(address indexed operator, address indexed tokenHolder);

    /// @notice Emitted when an operator is revoked by an account for all partitions of the account
    /// @param operator The account that changed their delegation
    /// @param tokenHolder The account who revoked the operator
    event OperatorRevoked(address indexed operator, address indexed tokenHolder);

    /**
     * @notice Initialises the operator capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeOperator() external;

    /**
     * @notice Authorises an operator for all partitions of `msg.sender`
     * @param _operator An address which is being authorised
     */
    function authorizeOperator(address _operator) external;

    /**
     * @notice Revokes authorisation of an operator previously given for all partitions of `msg.sender`
     * @param _operator An address which is being de-authorised
     */
    function revokeOperator(address _operator) external;

    /**
     * @notice Determines whether `_operator` is an operator for all partitions of `_tokenHolder`
     * @param _operator The operator to check
     * @param _tokenHolder The token holder to check
     * @return Whether the `_operator` is an operator for all partitions of `_tokenHolder`
     */
    function isOperator(address _operator, address _tokenHolder) external view returns (bool);
}
