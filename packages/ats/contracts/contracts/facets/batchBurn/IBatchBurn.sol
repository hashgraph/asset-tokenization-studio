// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IBatchBurn
 * @notice Interface for batch burning tokens from multiple addresses in a single transaction.
 * @dev Intended for use by authorised controllers and agents operating on ERC3643-compliant tokens.
 *      Exposes the `batchBurn` selector registered in the Diamond proxy under `_BATCH_BURN_RESOLVER_KEY`.
 * @author Asset Tokenization Studio Team
 */
interface IBatchBurn {
    /**
     * @notice Burns tokens from multiple addresses in a single transaction.
     * @dev Caller must hold `CONTROLLER_ROLE` or `AGENT_ROLE`. The token must not be paused
     *      and must not be configured for multi-partition. Emits `IController.ControllerRedemption`
     *      for each address processed.
     * @param _userAddresses Addresses from which tokens will be burnt.
     * @param _amounts Corresponding token amounts to burn. Must be the same length as `_userAddresses`.
     */
    function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
}
