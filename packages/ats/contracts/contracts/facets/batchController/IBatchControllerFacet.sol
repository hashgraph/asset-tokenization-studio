// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IBatchControllerFacet
 * @notice Interface for controller-only batch transfer operations.
 * @dev Defines the write surface of the `BatchControllerFacet` diamond facet. The facet exposes
 *      privileged batch transfers that move tokens between arbitrary addresses and are gated on
 *      the controller/agent roles. Non-privileged batch operations (batchTransfer, batchMint,
 *      batchBurn) remain on the ERC-3643 batch facet.
 */
interface IBatchControllerFacet {
    /**
     * @notice Batch forced transfer of tokens from multiple source addresses to multiple destinations.
     * @dev Restricted to accounts holding the controller or agent role. Requires the token to be
     *      controllable and operating in single-partition mode. Emits one
     *      `IERC1644.ControllerTransfer` event per element.
     * @param _fromList Source addresses to debit.
     * @param _toList Destination addresses to credit.
     * @param _amounts Amounts to transfer, positionally aligned with `_fromList` and `_toList`.
     */
    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    ) external;
}
