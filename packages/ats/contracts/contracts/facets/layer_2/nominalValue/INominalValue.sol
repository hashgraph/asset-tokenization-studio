// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface INominalValue {
    event NominalValueSet(address indexed operator, uint256 nominalValue, uint8 nominalValueDecimals);

    function initializeNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external;

    /**
     * @notice Marks the NominalValue facet as ready following a Diamond upgrade.
     * @dev Called during upgrade re-initialisation. No storage migration is performed;
     *      existing state carries over unchanged. Reverts if the facet was not previously
     *      registered at one of the accepted config versions, or is already marked ready at
     *      the current config version.
     * @param fromVersions Accepted previous config versions for this upgrade path.
     */
    function reinitializeNominalValue(uint256[] calldata fromVersions) external;

    function setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external;
    function getNominalValue() external view returns (uint256);
    function getNominalValueDecimals() external view returns (uint8);
}
