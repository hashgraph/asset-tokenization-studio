// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICompliance } from "./externalInterfaces/ICompliance.sol";

/// @custom:hash resolverKey Compliance
bytes32 constant RESOLVER_KEY_COMPLIANCE = 0x0e30d654f46079d52767224a07d1fe1adc91d7edba6504f2f0adca0fca972180;

/// @title IComplianceFacet
/// @author Asset Tokenization Studio Team
/// @notice Interface for the Compliance facet that wires an external compliance contract,
///         provides transfer eligibility checks, and exposes the compliance contract address.
interface IComplianceFacet {
    /**
     * @notice Emitted once when the compliance capability is initialised on a token.
     * @dev Fires exclusively from `initializeCompliance`.
     * @param compliance The compliance contract address wired at initialisation.
     */
    event ComplianceInitialized(address compliance);

    /**
     * @notice Initialises the compliance capability on the token and wires the compliance contract.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     * @param _compliance Address of the compliance contract that authorises transfers.
     */
    function initializeCompliance(address _compliance) external;

    /**
     * @notice Sets the compliance contract address
     * @param _compliance The address of the new compliance contract
     */
    function setCompliance(address _compliance) external;

    /**
     * @notice Checks if a transfer can be executed
     * @param _to The recipient address
     * @param _value The amount of tokens to transfer
     * @param _data Additional data for the transfer check
     * @return bool True if the transfer can be executed
     * @return bytes1 EIP1066 status code indicating the result
     * @return bytes32 Additional reason data for the result
     */
    function canTransfer(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external view returns (bool, bytes1, bytes32);

    /**
     * @notice Checks if a transferFrom can be executed
     * @param _from The sender address
     * @param _to The recipient address
     * @param _value The amount of tokens to transfer
     * @param _data Additional data for the transfer check
     * @return bool True if the transfer can be executed
     * @return bytes1 EIP1066 status code indicating the result
     * @return bytes32 Additional reason data for the result
     */
    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external view returns (bool, bytes1, bytes32);

    /**
     * @notice Returns the address of the compliance contract
     * @return ICompliance The compliance contract
     */
    function compliance() external view returns (ICompliance);
}
