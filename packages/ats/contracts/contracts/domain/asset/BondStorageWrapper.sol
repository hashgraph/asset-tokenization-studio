// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { IPrincipal } from "../../facets/principal/IPrincipal.sol";
import { NominalValueStorageWrapper } from "./nominalValue/NominalValueStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _BOND_STORAGE_POSITION } from "../../constants/storagePositions.sol";

/// @title Bond Storage Wrapper
/// @notice Library for managing Bond token storage operations.
/// @author Asset Tokenization Studio Team
library BondStorageWrapper {
    struct BondDataStorage {
        bytes3 currency;
        uint256 startingDate;
        uint256 maturityDate;
        bool initialized;
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

    function getPrincipalFor(address account) internal view returns (IPrincipal.PrincipalFor memory principalFor_) {
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
