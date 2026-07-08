// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Operator
bytes32 constant RESOLVER_KEY_OPERATOR = 0x5c2062c6ba02b76ae0c3884d5c0fdd3416b2012195a964efaa34e09b1fa31c95;

/**
 * @title IOperator
 * @author Asset Tokenization Studio Team
 * @notice Interface for operator management: query, authorise and revoke operators for all partitions.
 */
interface IOperator {
    /**
     * @notice Emitted once when the operator capability is initialised on a token.
     * @dev Fires exclusively from `initializeOperator`.
     */
    event OperatorInitialized();

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
