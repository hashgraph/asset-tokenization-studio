// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICompliance } from "../layer_1/ERC3643/ICompliance.sol";

interface IComplianceFacet {
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
     * @return ICompliance The compliance contract interface
     */
    function compliance() external view returns (ICompliance);
}
