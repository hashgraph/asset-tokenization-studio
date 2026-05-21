// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondTypes } from "../layer_2/bond/IBondTypes.sol";

/// @custom:hash resolverKey Maturity
bytes32 constant RESOLVER_KEY_MATURITY = 0x16825792debc7c17efd86bdf71500575f9ff5d4aa20e3a35031c583437a3ca82;

/**
 * @title  IMaturity
 * @notice Interface for bond maturity redemption and maturity date management.
 * @dev    `fullRedeemAtMaturity` and `updateMaturityDate` are extracted from the Bond facet
 *         into a dedicated Maturity facet registered under `_MATURITY_RESOLVER_KEY`.
 *         Events and errors — `MaturityDateUpdated` and `BondMaturityDateWrong` — are
 *         inherited from `IBondTypes`.
 * @author Asset Tokenization Studio Team
 */
interface IMaturity is IBondTypes {
    /**
     * @notice Emitted once when the maturity capability is initialised on a token.
     * @dev Fires exclusively from `initializeMaturity`.
     */
    event MaturityInitialized();

    /**
     * @notice Initialises the maturity capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeMaturity() external;

    /**
     * @notice Redeems all token partitions held by a token holder at bond maturity.
     * @dev    Caller must hold `ROLE_MATURITY_REDEEMER`. Contract must be unpaused and clearing
     *         must be disabled. `_tokenHolder` must be on the allowed list, hold granted KYC
     *         status, must not be recovered, and the current timestamp must be at or past the
     *         maturity date. Iterates every partition owned by `_tokenHolder` and redeems each
     *         balance in full. Reverts with an unexpected error if any partition balance is zero.
     * @dev    Emits {RedeemedByPartition} for each redeemed partition via
     *         `ERC1410StorageWrapper.redeemByPartition`.
     * @param  _tokenHolder Address of the token holder whose partitions are to be redeemed.
     */
    function fullRedeemAtMaturity(address _tokenHolder) external;

    /**
     * @notice Updates the bond maturity date to a new timestamp.
     * @dev    Caller must hold `ROLE_BOND_MANAGER`. Contract must be unpaused. `_newMaturityDate`
     *         must satisfy the validity constraint enforced by `onlyValidMaturityDate` — the new
     *         date must be strictly greater than the current maturity date. Persists the new date
     *         via `BondStorageWrapper.setMaturityDate`.
     * @dev    Emits {MaturityDateUpdated} with the contract address, the new maturity date, and
     *         the previous maturity date.
     * @param  _newMaturityDate New maturity timestamp to set (Unix epoch, in seconds).
     * @return success_         Always `true` on successful execution.
     */
    function updateMaturityDate(uint256 _newMaturityDate) external returns (bool success_);
}
