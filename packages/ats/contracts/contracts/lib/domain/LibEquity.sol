// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EquityDataStorage, equityStorage } from "../../storage/AssetStorage.sol";
import { IEquity } from "../../facets/assetCapabilities/interfaces/equity/IEquity.sol";

// ═══════════════════════════════════════════════════════════════════════════════
// LIB EQUITY — Equity-specific storage management library
// ═══════════════════════════════════════════════════════════════════════════════
//
// Provides equity initialization and query functions for the library-based diamond
// pattern. Manages equity rights (voting, information, liquidation, etc.) and
// dividend/voting metadata storage without logic orchestration.
//
// ═══════════════════════════════════════════════════════════════════════════════

library LibEquity {
    // ═══════════════════════════════════════════════════════════════════════════════
    // EQUITY INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Initializes equity-specific storage from equity details data
    /// @dev Called during equity contract deployment to set up initial rights and properties
    /// @param _equityDetailsData The equity configuration data (rights, currency, nominal value)
    function storeEquityDetails(IEquity.EquityDetailsData memory _equityDetailsData) internal {
        EquityDataStorage storage equity = equityStorage();
        equity.votingRight = _equityDetailsData.votingRight;
        equity.informationRight = _equityDetailsData.informationRight;
        equity.liquidationRight = _equityDetailsData.liquidationRight;
        equity.subscriptionRight = _equityDetailsData.subscriptionRight;
        equity.conversionRight = _equityDetailsData.conversionRight;
        equity.redemptionRight = _equityDetailsData.redemptionRight;
        equity.putRight = _equityDetailsData.putRight;
        equity.dividendRight = uint8(_equityDetailsData.dividendRight);
        equity.currency = _equityDetailsData.currency;
        equity.nominalValue = _equityDetailsData.nominalValue;
        equity.nominalValueDecimals = _equityDetailsData.nominalValueDecimals;
        equity.initialized = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EQUITY RIGHTS QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Retrieves the complete equity details configuration
    /// @return equityDetails_ The equity details data (rights, currency, nominal value)
    function getEquityDetails() internal view returns (IEquity.EquityDetailsData memory equityDetails_) {
        EquityDataStorage storage equity = equityStorage();
        equityDetails_ = IEquity.EquityDetailsData({
            votingRight: equity.votingRight,
            informationRight: equity.informationRight,
            liquidationRight: equity.liquidationRight,
            subscriptionRight: equity.subscriptionRight,
            conversionRight: equity.conversionRight,
            redemptionRight: equity.redemptionRight,
            putRight: equity.putRight,
            dividendRight: IEquity.DividendType(equity.dividendRight),
            currency: equity.currency,
            nominalValue: equity.nominalValue,
            nominalValueDecimals: equity.nominalValueDecimals
        });
    }

    /// @notice Checks if equity has voting rights
    /// @return True if voting right is enabled
    function hasVotingRight() internal view returns (bool) {
        return equityStorage().votingRight;
    }

    /// @notice Checks if equity has information rights
    /// @return True if information right is enabled
    function hasInformationRight() internal view returns (bool) {
        return equityStorage().informationRight;
    }

    /// @notice Checks if equity has liquidation rights
    /// @return True if liquidation right is enabled
    function hasLiquidationRight() internal view returns (bool) {
        return equityStorage().liquidationRight;
    }

    /// @notice Checks if equity has subscription rights
    /// @return True if subscription right is enabled
    function hasSubscriptionRight() internal view returns (bool) {
        return equityStorage().subscriptionRight;
    }

    /// @notice Checks if equity has conversion rights
    /// @return True if conversion right is enabled
    function hasConversionRight() internal view returns (bool) {
        return equityStorage().conversionRight;
    }

    /// @notice Checks if equity has redemption rights
    /// @return True if redemption right is enabled
    function hasRedemptionRight() internal view returns (bool) {
        return equityStorage().redemptionRight;
    }

    /// @notice Checks if equity has put rights
    /// @return True if put right is enabled
    function hasPutRight() internal view returns (bool) {
        return equityStorage().putRight;
    }

    /// @notice Retrieves the dividend type (NONE, PREFERRED, COMMON)
    /// @return The dividend type enumeration
    function getDividendType() internal view returns (IEquity.DividendType) {
        return IEquity.DividendType(equityStorage().dividendRight);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EQUITY VALUE PROPERTIES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Retrieves the currency code (ISO 4217, 3 bytes)
    /// @return The currency code as bytes3
    function getCurrency() internal view returns (bytes3) {
        return equityStorage().currency;
    }

    /// @notice Retrieves the nominal value of the equity
    /// @return The nominal value
    function getNominalValue() internal view returns (uint256) {
        return equityStorage().nominalValue;
    }

    /// @notice Retrieves the decimal precision for nominal value
    /// @return The number of decimals for nominal value representation
    function getNominalValueDecimals() internal view returns (uint8) {
        return equityStorage().nominalValueDecimals;
    }

    /// @notice Checks if equity storage has been initialized
    /// @return True if equity has been initialized
    function isInitialized() internal view returns (bool) {
        return equityStorage().initialized;
    }
}
