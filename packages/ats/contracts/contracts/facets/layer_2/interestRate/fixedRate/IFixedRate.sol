// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IFixedRate {
    struct FixedRateData {
        uint256 rate;
        uint8 rateDecimals;
    }

    event RateUpdated(address indexed operator, uint256 newRate, uint8 newRateDecimals);

    error InterestRateIsFixed();

    function initializeFixedRate(FixedRateData calldata _initData) external;

    /**
     * @notice Marks the FixedRate facet as ready following a Diamond upgrade.
     * @dev Called during upgrade re-initialisation. No storage migration is performed;
     *      existing state carries over unchanged. Reverts if the facet was not previously
     *      registered at one of the accepted config versions, or is already marked ready at
     *      the current config version.
     * @param fromVersions Accepted previous config versions for this upgrade path.
     */
    function reinitializeFixedRate(uint256[] calldata fromVersions) external;

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external;

    function getRate() external view returns (uint256 rate_, uint8 decimals_);
}
