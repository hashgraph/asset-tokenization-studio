// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { IPrincipal } from "../../facets/principal/IPrincipal.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { NominalValueStorageWrapper } from "./nominalValue/NominalValueStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/// @custom:hash storage Bond
bytes32 constant STORAGE_LOCATION_BOND = 0xa99cdff87e8b13602d53b3661888bce1eb21f534ea5cb3f8223de98640507c00;

/// @custom:storage-location erc7201:security.token.standard.storage.Bond
struct BondDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool initialized;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 startingDate;
    uint256 maturityDate;

    // ─── APPEND-ONLY ZONE BELOW ───
}

/// @title Bond Storage Wrapper
/// @notice Library for managing Bond token storage operations.
/// @author Asset Tokenization Studio Team
library BondStorageWrapper {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_bond(IBondTypes.BondDetailsData calldata bondDetailsData) internal {
        BondDataStorage storage bs = _bondStorage();
        bs.initialized = true;
        bs.startingDate = bondDetailsData.startingDate;
        bs.maturityDate = bondDetailsData.maturityDate;
    }

    function setMaturityDate(uint256 maturityDate) internal {
        _bondStorage().maturityDate = maturityDate;
    }

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

    function getMaturityDate() internal view returns (uint256 maturityDate_) {
        return _bondStorage().maturityDate;
    }

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

    function isBondInitialized() internal view returns (bool) {
        return _bondStorage().initialized;
    }

    function requireValidMaturityDate(uint256 maturityDate) internal view {
        if (maturityDate <= getMaturityDate()) revert IBondTypes.BondMaturityDateWrong();
    }

    function _bondStorage() private pure returns (BondDataStorage storage bondData_) {
        bytes32 position = STORAGE_LOCATION_BOND;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            bondData_.slot := position
        }
    }
}
