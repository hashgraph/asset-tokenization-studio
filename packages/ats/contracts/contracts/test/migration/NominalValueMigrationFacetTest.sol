// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { _NOMINAL_VALUE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { BondStorageWrapper } from "../../domain/asset/BondStorageWrapper.sol";
import { EquityStorageWrapper } from "../../domain/asset/EquityStorageWrapper.sol";
import { NominalValueStorageWrapper } from "../../domain/asset/nominalValue/NominalValueStorageWrapper.sol";

/**
 * @dev Test facet for NominalValue storage migration testing.
 * Exposes storage accessors to set up legacy storage state and _verify migration behavior.
 * This facet is for testing purposes only and should not be deployed to production.
 */
contract NominalValueMigrationFacetTest is Modifiers, IStaticFunctionSelectors {
    function setLegacyBondNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external {
        BondStorageWrapper.setDeprecatedNominalValue(_nominalValue, _nominalValueDecimals);
    }

    function setLegacyEquityNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external {
        EquityStorageWrapper.setDeprecatedNominalValue(_nominalValue, _nominalValueDecimals);
    }

    /// @dev Resets the NominalValue initialized flag and clears stored values.
    /// nominalValue is at slot `position`, nominalValueDecimals + initialized are packed at `position + 1`.
    function resetNominalValueInitialized() external {
        bytes32 position = _NOMINAL_VALUE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(position, 0)
            sstore(add(position, 1), 0)
        }
    }

    function getLegacyBondNominalValue() external view returns (uint256 nominalValue_, uint8 nominalValueDecimals_) {
        nominalValue_ = BondStorageWrapper.getDeprecatedNominalValue();
        nominalValueDecimals_ = BondStorageWrapper.getDeprecatedNominalValueDecimals();
    }

    function getLegacyEquityNominalValue() external view returns (uint256 nominalValue_, uint8 nominalValueDecimals_) {
        nominalValue_ = EquityStorageWrapper.getDeprecatedNominalValue();
        nominalValueDecimals_ = EquityStorageWrapper.getDeprecatedNominalValueDecimals();
    }

    function getAggregatedNominalValue() external view returns (uint256) {
        return NominalValueStorageWrapper.getNominalValue();
    }

    function getAggregatedNominalValueDecimals() external view returns (uint8) {
        return NominalValueStorageWrapper.getNominalValueDecimals();
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](7);
        uint256 selectorIndex;
        staticFunctionSelectors_[selectorIndex++] = this.setLegacyBondNominalValue.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setLegacyEquityNominalValue.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLegacyBondNominalValue.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLegacyEquityNominalValue.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAggregatedNominalValue.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAggregatedNominalValueDecimals.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetNominalValueInitialized.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](0);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = keccak256("NominalValueMigrationFacetTest");
    }
}
