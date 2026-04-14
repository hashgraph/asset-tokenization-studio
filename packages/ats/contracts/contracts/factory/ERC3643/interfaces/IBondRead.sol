// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/bond/IBondRead.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

import { TRexIBondTypes as IBondTypes } from "./IBondTypes.sol";

/// @title IBondRead
/// @notice Read functions for Bond domain operations
interface TRexIBondRead is IBondTypes {
    /**
     * @notice Retrieves the bond details
     */
    function getBondDetails() external view returns (IBondTypes.BondDetailsData memory bondDetailsData_);

    /**
     * @notice Retrieves principal numerator and denominator for a specific account
     */
    function getPrincipalFor(address _account) external view returns (IBondTypes.PrincipalFor memory principalFor_);
}
