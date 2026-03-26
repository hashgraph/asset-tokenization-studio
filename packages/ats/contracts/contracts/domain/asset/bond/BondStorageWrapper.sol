// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { IBondRead } from "../../../facets/layer_2/bond/IBondRead.sol";
import { IBondStorageWrapper } from "../../../domain/asset/bond/IBondStorageWrapper.sol";
import { CouponStorageWrapper } from "../coupon/CouponStorageWrapper.sol";

abstract contract BondStorageWrapper is IBondStorageWrapper, CouponStorageWrapper {
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
        // solhint-disable-next-line var-name-mixedcase
        uint256[] DEPRECATED_couponsOrderedListByIds;
    }

    /**
     * @dev Modifier to ensure that the function is called only after the current maturity date.
     * @param _maturityDate The maturity date to be checked against the current maturity date.
     * Reverts with `BondMaturityDateWrong` if the provided maturity date is less than or equal
     * to the current maturity date.
     */
    modifier onlyAfterCurrentMaturityDate(uint256 _maturityDate) override {
        _checkMaturityDate(_maturityDate);
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_bond(
        IBondRead.BondDetailsData calldata _bondDetailsData
    )
        internal
        override
        validateDates(_bondDetailsData.startingDate, _bondDetailsData.maturityDate)
        onlyValidTimestamp(_bondDetailsData.startingDate)
    {
        BondDataStorage storage bondStorage = _bondStorage();
        bondStorage.initialized = true;
        _setCurrency(_bondDetailsData.currency);
        _setStartingDate(_bondDetailsData.startingDate);
        _setMaturityDate(_bondDetailsData.maturityDate);
    }

    function _setCurrency(bytes3 _currency) internal override {
        _bondStorage().currency = _currency;
    }

    function _setStartingDate(uint256 _startingDate) internal override {
        _bondStorage().startingDate = _startingDate;
    }

    /**
     * @dev Internal function to set the maturity date of the bond.
     * @param _maturityDate The new maturity date to be set.
     * @return success_ True if the maturity date was set successfully.
     */
    function _setMaturityDate(uint256 _maturityDate) internal override returns (bool success_) {
        _bondStorage().maturityDate = _maturityDate;
        return true;
    }

    /// @dev DEPRECATED – MIGRATION: Remove this function and the DEPRECATED_ fields from
    /// BondDataStorage once all legacy tokens have been migrated.
    function _migrateBondNominalValue() internal override {
        if (_bondStorage().DEPRECATED_nominalValue == 0) return;
        _bondStorage().DEPRECATED_nominalValue = 0;
        _bondStorage().DEPRECATED_nominalValueDecimals = 0;
    }

    function _getBondDetails() internal view override returns (IBondRead.BondDetailsData memory bondDetails_) {
        bondDetails_ = IBondRead.BondDetailsData({
            currency: _bondStorage().currency,
            nominalValue: _getNominalValue(),
            nominalValueDecimals: _getNominalValueDecimals(),
            startingDate: _bondStorage().startingDate,
            maturityDate: _bondStorage().maturityDate
        });
    }

    function _getMaturityDate() internal view override returns (uint256 maturityDate_) {
        return _bondStorage().maturityDate;
    }

    function _getPrincipalFor(
        address _account
    ) internal view override returns (IBondRead.PrincipalFor memory principalFor_) {
        IBondRead.BondDetailsData memory bondDetails = _getBondDetails();

        principalFor_.numerator = _balanceOfAdjustedAt(_account, _blockTimestamp()) * bondDetails.nominalValue;
        principalFor_.denominator = 10 ** (_decimalsAdjustedAt(_blockTimestamp()) + bondDetails.nominalValueDecimals);
    }

    function _isBondInitialized() internal view override returns (bool) {
        return _bondStorage().initialized;
    }
    // solhint-disable-next-line func-name-mixedcase
    function _DEPRECATED_BOND_getCouponsOrderedListTotal() internal view override returns (uint256 total_) {
        return _bondStorage().DEPRECATED_couponsOrderedListByIds.length;
    }
    // solhint-disable-next-line func-name-mixedcase
    function _DEPRECATED_BOND_getCouponsOrderedListByPosition(
        uint256 _position
    ) internal view override returns (uint256 total_) {
        return _bondStorage().DEPRECATED_couponsOrderedListByIds[_position];
    }

    /// @dev DEPRECATED – MIGRATION: Remove once all legacy tokens have been migrated.
    function _bondNominalValue() internal view virtual override returns (uint256) {
        return _bondStorage().DEPRECATED_nominalValue;
    }

    /// @dev DEPRECATED – MIGRATION: Remove once all legacy tokens have been migrated.
    function _bondNominalValueDecimals() internal view virtual override returns (uint8) {
        return _bondStorage().DEPRECATED_nominalValueDecimals;
    }

    function _bondStorage() internal pure returns (BondDataStorage storage bondData_) {
        bytes32 position = _BOND_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            bondData_.slot := position
        }
    }

    function _checkMaturityDate(uint256 _maturityDate) private view {
        if (_maturityDate <= _getMaturityDate()) revert BondMaturityDateWrong();
    }
}
