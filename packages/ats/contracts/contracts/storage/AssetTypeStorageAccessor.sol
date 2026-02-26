// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _EQUITY_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SECURITY_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { ISecurity } from "../facets/regulation/interfaces/ISecurity.sol";

/// @dev Bond data storage
struct BondDataStorage {
    bytes3 currency;
    uint256 nominalValue;
    uint256 startingDate;
    uint256 maturityDate;
    bool initialized;
    uint8 nominalValueDecimals;
    uint256[] couponsOrderedListByIds;
}

/// @dev Equity data storage
struct EquityDataStorage {
    bool votingRight;
    bool informationRight;
    bool liquidationRight;
    bool subscriptionRight;
    bool conversionRight;
    bool redemptionRight;
    bool putRight;
    // Note: DividendType from IEquity, using bytes for generic storage
    uint8 dividendRight;
    bytes3 currency;
    uint256 nominalValue;
    bool initialized;
    uint8 nominalValueDecimals;
}

/// @dev Access bond storage
function bondStorage() pure returns (BondDataStorage storage bond_) {
    bytes32 pos = _BOND_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        bond_.slot := pos
    }
}

/// @dev Access equity storage
function equityStorage() pure returns (EquityDataStorage storage equity_) {
    bytes32 pos = _EQUITY_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        equity_.slot := pos
    }
}

/// @dev Access security storage
function securityStorage() pure returns (ISecurity.SecurityRegulationData storage security_) {
    bytes32 pos = _SECURITY_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        security_.slot := pos
    }
}
