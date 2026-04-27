// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { NominalValueStorageWrapper } from "./nominalValue/NominalValueStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _BOND_STORAGE_POSITION } from "../../constants/storagePositions.sol";

/// @title Bond Storage Wrapper
/// @notice Library for managing Bond token storage operations.
/// @dev Provides structured access to BondDataStorage with migration support for NominalValue.
library BondStorageWrapper {
    struct BondDataStorage {
        bytes3 currency;
        /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
        // solhint-disable-next-line var-name-mixedcase
        uint256 DEPRECATED_nominalValue;
        uint256 startingDate;
        uint256 maturityDate;
        bool initialized;
        /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
        // solhint-disable-next-line var-name-mixedcase
        uint8 DEPRECATED_nominalValueDecimals;
        /// @deprecated Kept for storage layout compatibility. Use CouponStorageWrapper instead.
        // solhint-disable-next-line var-name-mixedcase
        uint256[] DEPRECATED_couponsOrderedListByIds;
    }

    // solhint-disable-next-line func-name-mixedcase
    function DEPRECATED_pushCouponOrderedListId(uint256 couponID) internal {
        _bondStorage().DEPRECATED_couponsOrderedListByIds.push(couponID);
    }

    // solhint-disable-next-line func-name-mixedcase
    function initialize_bond(IBondTypes.BondDetailsData calldata bondDetailsData) internal {
        BondDataStorage storage bs = _bondStorage();
        bs.initialized = true;
        bs.currency = bondDetailsData.currency;
        bs.startingDate = bondDetailsData.startingDate;
        bs.maturityDate = bondDetailsData.maturityDate;
    }

    function setMaturityDate(uint256 maturityDate) internal {
        _bondStorage().maturityDate = maturityDate;
    }

    /// @dev DEPRECATED – MIGRATION: Remove this function and the DEPRECATED_ fields from
    /// BondDataStorage once all legacy tokens have been migrated.
    function clearNominalValue() internal {
        BondDataStorage storage $ = _bondStorage();
        $.DEPRECATED_nominalValue = 0;
        $.DEPRECATED_nominalValueDecimals = 0;
    }

    // This is for testing only
    function setDeprecatedNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        BondDataStorage storage $ = _bondStorage();
        $.DEPRECATED_nominalValue = _nominalValue;
        $.DEPRECATED_nominalValueDecimals = _nominalValueDecimals;
    }

    function getDeprecatedNominalValue() internal view returns (uint256 nominalValue_) {
        nominalValue_ = _bondStorage().DEPRECATED_nominalValue;
    }

    // solhint-disable-next-line func-name-mixedcase
    function DEPRECATED_getCouponsOrderedListTotal() internal view returns (uint256) {
        return _bondStorage().DEPRECATED_couponsOrderedListByIds.length;
    }

    // solhint-disable-next-line func-name-mixedcase
    function DEPRECATED_getCouponsOrderedListByPosition(uint256 position) internal view returns (uint256) {
        return _bondStorage().DEPRECATED_couponsOrderedListByIds[position];
    }

    function getDeprecatedNominalValueDecimals() internal view returns (uint8 nominalValueDecimals_) {
        nominalValueDecimals_ = _bondStorage().DEPRECATED_nominalValueDecimals;
    }

    function getBondDetails() internal view returns (IBondTypes.BondDetailsData memory bondDetails_) {
        BondDataStorage storage bs = _bondStorage();
        bondDetails_ = IBondTypes.BondDetailsData({
            currency: bs.currency,
            nominalValue: NominalValueStorageWrapper.getNominalValue(),
            nominalValueDecimals: NominalValueStorageWrapper.getNominalValueDecimals(),
            startingDate: bs.startingDate,
            maturityDate: bs.maturityDate
        });
    }

    function getMaturityDate() internal view returns (uint256 maturityDate_) {
        return _bondStorage().maturityDate;
    }

    function getPrincipalFor(address account) internal view returns (IBondTypes.PrincipalFor memory principalFor_) {
        IBondTypes.BondDetailsData memory bondDetails = getBondDetails();

        principalFor_.numerator =
            ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, TimeTravelStorageWrapper.getBlockTimestamp()) *
            bondDetails.nominalValue;
        principalFor_.denominator =
            10 **
                (ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp()) +
                    bondDetails.nominalValueDecimals);
    }

    function isBondInitialized() internal view returns (bool) {
        return _bondStorage().initialized;
    }

    function requireValidMaturityDate(uint256 maturityDate) internal view {
        if (maturityDate <= getMaturityDate()) revert IBondTypes.BondMaturityDateWrong();
    }

    function _bondStorage() private pure returns (BondDataStorage storage bondData_) {
        bytes32 position = _BOND_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            bondData_.slot := position
        }
    }
}
