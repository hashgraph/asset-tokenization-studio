// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { IBondRead } from "../../../facets/layer_2/bond/IBondRead.sol";
import { IBondStorageWrapper } from "../../../domain/asset/bond/IBondStorageWrapper.sol";
import { CouponStorageWrapper } from "../coupon/CouponStorageWrapper.sol";

abstract contract BondStorageWrapper is IBondStorageWrapper, CouponStorageWrapper {
    struct BondDataStorage {
        bytes3 currency;
        uint256 nominalValue;
        uint256 startingDate;
        uint256 maturityDate;
        bool initialized;
        uint8 nominalValueDecimals;
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
        _storeBondDetails(_bondDetailsData);
    }

    function _storeBondDetails(IBondRead.BondDetailsData memory _bondDetails) internal override {
        _bondStorage().currency = _bondDetails.currency;
        _bondStorage().nominalValue = _bondDetails.nominalValue;
        _bondStorage().nominalValueDecimals = _bondDetails.nominalValueDecimals;
        _bondStorage().startingDate = _bondDetails.startingDate;
        _bondStorage().maturityDate = _bondDetails.maturityDate;
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

    function _getBondDetails() internal view override returns (IBondRead.BondDetailsData memory bondDetails_) {
        bondDetails_ = IBondRead.BondDetailsData({
            currency: _bondStorage().currency,
            nominalValue: _bondStorage().nominalValue,
            nominalValueDecimals: _bondStorage().nominalValueDecimals,
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
