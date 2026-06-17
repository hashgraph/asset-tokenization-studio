// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { IKpiLinkedRate } from "../../facets/kpiLinkedRate/IKpiLinkedRate.sol";
import { IInterestRate } from "../../facets/interestRate/IInterestRate.sol";

/**
 * @title InterestRateModifiers
 * @author Asset Tokenization Studio Team
 * @notice Modifier contract for the InterestRate domain — FixedRate and KpiLinkedRate.
 * @dev Provides modifiers that enforce initialisation state invariants by delegating to
 *      _check* functions from InterestRateStorageWrapper rather than implementing
 *      validation inline.
 */
abstract contract InterestRateModifiers {
    /**
     * @dev Reverts with WrongInterestRateValues if minRate > baseRate or baseRate > maxRate.
     * @param _newInterestRate The interest rate struct to validate.
     */
    modifier onlyValidInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
        _;
    }

    /**
     * @notice Modifier that validates the KPI-linked impact data ordering invariant.
     * @dev Reverts with WrongImpactDataValues if the deviation bounds are not strictly ordered.
     * @param _newImpactData The impact data struct to validate.
     */
    modifier onlyValidImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
        _;
    }
}
