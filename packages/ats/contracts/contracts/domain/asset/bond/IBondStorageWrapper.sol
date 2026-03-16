// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IBondStorageWrapper {
    /**
     * @notice Provided maturity date is invalid (e.g. in the past or before issuance).
     */
    error BondMaturityDateWrong();
}
