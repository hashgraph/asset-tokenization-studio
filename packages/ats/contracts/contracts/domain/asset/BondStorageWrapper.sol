// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { IPrincipal } from "../../facets/principal/IPrincipal.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { NominalValueStorageWrapper } from "./NominalValueStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/// @custom:hash storage Bond
bytes32 constant STORAGE_LOCATION_BOND = 0xa99cdff87e8b13602d53b3661888bce1eb21f534ea5cb3f8223de98640507c00;

/**
 * @notice Persistent storage layout for the Bond facet.
 * @dev Holds the initialisation flag and the lifecycle timestamps that frame a bond
 *      instrument. Currency, nominal value and nominal-value decimals are owned by
 *      {NominalValueStorageWrapper}; this struct only captures the bond-specific dates.
 *      New fields must be appended below the marker to preserve ERC-7201 slot offsets.
 * @custom:storage-location erc7201:security.token.standard.storage.Bond
 */
struct BondDataStorage {
    // ─── R2 Single-slot scalars (uint256, bytes32, string) ───
    uint256 startingDate;
    uint256 maturityDate;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    // ─── APPEND-ONLY ZONE BELOW ───
}

/// @title Bond Storage Wrapper
/// @notice Library for managing Bond token storage operations.
/// @author Asset Tokenization Studio Team
library BondStorageWrapper {
    /**
     * @notice Initialises the bond storage with the supplied lifecycle dates.
     * @dev Sets the initialised flag and records the starting and maturity timestamps.
     *      Currency, nominal value and nominal-value decimals are persisted by
     *      {NominalValueStorageWrapper} and are not duplicated here.
     * @param bondDetailsData The bond details passed at deployment time.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_bond(IBondTypes.BondDetailsData calldata bondDetailsData) internal {
        BondDataStorage storage bs = _bondStorage();
        bs.startingDate = bondDetailsData.startingDate;
        bs.maturityDate = bondDetailsData.maturityDate;
    }

    /**
     * @notice Updates the bond maturity date in storage.
     * @dev Callers are expected to enforce ordering invariants (e.g. monotonic extension)
     *      via {requireValidMaturityDate} before invoking this helper.
     * @param maturityDate The new maturity timestamp to persist.
     */
    function setMaturityDate(uint256 maturityDate) internal {
        _bondStorage().maturityDate = maturityDate;
    }

    /**
     * @notice Returns the aggregated bond details, combining nominal-value and date storage.
     * @dev Reads currency, nominal value and decimals from {NominalValueStorageWrapper};
     *      reads starting and maturity dates from this wrapper's storage slot.
     * @return bondDetails_ The bond details snapshot.
     */
    function getBondDetails() internal view returns (IBondTypes.BondDetailsData memory bondDetails_) {
        BondDataStorage storage bs = _bondStorage();
        bondDetails_ = IBondTypes.BondDetailsData({
            currency: NominalValueStorageWrapper.getNominalValueCurrency(),
            nominalValue: NominalValueStorageWrapper.getNominalValue(),
            nominalValueDecimals: NominalValueStorageWrapper.getNominalValueDecimals(),
            startingDate: bs.startingDate,
            maturityDate: bs.maturityDate
        });
    }

    /**
     * @notice Returns the bond's maturity timestamp.
     * @return maturityDate_ The maturity date in seconds since the Unix epoch.
     */
    function getMaturityDate() internal view returns (uint256 maturityDate_) {
        return _bondStorage().maturityDate;
    }

    /**
     * @notice Computes the principal-due fraction for a token holder at the current block.
     * @dev Numerator multiplies the holder's adjusted balance by the bond nominal value;
     *      denominator scales by `10 ** (tokenDecimals + nominalValueDecimals)` to keep
     *      the rational form intact and defer the division to the caller.
     * @param account The holder whose principal share is being computed.
     * @return principalFor_ The principal fraction expressed as `numerator / denominator`.
     */
    function getPrincipalFor(address account) internal view returns (IPrincipal.PrincipalFor memory principalFor_) {
        IBondTypes.BondDetailsData memory bondDetails = getBondDetails();
        uint256 blockTimestamp = TimeTravelStorageWrapper.getBlockTimestamp();

        // Pre-apply the nominal-value scale via 512-bit mulDiv: balance * nominal stays bounded
        // even at high precision, and the equivalent fraction keeps the token-decimal scale on
        // the denominator so sub-unit balances survive (numerator/denominator == old fraction).
        principalFor_.numerator = Math.mulDiv(
            TokenCoreOps.getTotalBalanceForAdjustedAt(account, blockTimestamp),
            bondDetails.nominalValue,
            DecimalsLib.pow10(bondDetails.nominalValueDecimals)
        );
        principalFor_.denominator = DecimalsLib.pow10(ERC20StorageWrapper.decimalsAdjustedAt(blockTimestamp));
    }

    /**
     * @notice Reverts if the supplied maturity date does not strictly extend the current one.
     * @dev Enforces a monotonic-extension invariant — maturity may only move forward in time.
     * @param maturityDate The candidate maturity timestamp.
     */
    function requireValidMaturityDate(uint256 maturityDate) internal view {
        if (maturityDate <= getMaturityDate()) revert IBondTypes.BondMaturityDateWrong();
    }

    /**
     * @notice Returns the storage reference at the ERC-7201 slot for the bond namespace.
     * @dev Resolved via inline assembly against {STORAGE_LOCATION_BOND}.
     * @return bondData_ The storage reference for the bond data struct.
     */
    function _bondStorage() private pure returns (BondDataStorage storage bondData_) {
        bytes32 position = STORAGE_LOCATION_BOND;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            bondData_.slot := position
        }
    }
}
