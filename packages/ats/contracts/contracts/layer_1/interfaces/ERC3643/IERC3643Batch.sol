// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
interface IERC3643Batch {
    /**
     * @notice Batch transfer tokens to multiple addresses
     */
    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external;

    /**
     * @notice Batch forced transfer tokens from multiple addresses to multiple addresses
     */
    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    ) external;

    /**
     * @notice Batch mint tokens to multiple addresses
     */
    function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external;

    /**
     * @notice Batch burn tokens from multiple addresses
     */
    function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
}
