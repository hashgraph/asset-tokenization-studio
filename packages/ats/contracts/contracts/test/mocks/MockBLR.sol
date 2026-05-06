// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCutManager } from "../../infrastructure/diamond/IDiamondCutManager.sol";
import { IDiamondLoupe } from "../../infrastructure/proxy/IDiamondLoupe.sol";

/**
 * @title MockBLR
 * @notice Minimal mock of IDiamondCutManager for unit-testing InitializerStorageWrapper.
 * @dev Only implements the two functions called by _prepareReinitialization.
 *   All other IDiamondCutManager functions revert — they are not exercised by these tests.
 */
contract MockBLR is IDiamondCutManager {
    uint256 private _facetsLength;
    uint256 private _totalFacets;
    uint256 private _unchangedFacets;
    bool private _isRegistered;

    // -------------------------------------------------------------------------
    // Setup helpers
    // -------------------------------------------------------------------------

    function setFacetsLength(uint256 n) external {
        _facetsLength = n;
    }

    function setTransitionDiff(uint256 total, uint256 unchanged, bool registered) external {
        _totalFacets = total;
        _unchangedFacets = unchanged;
        _isRegistered = registered;
    }

    function computeTransitionDiff(bytes32, uint256, bytes32, uint256) external override {}

    // -------------------------------------------------------------------------
    // IDiamondCutManager — stubs (not called by InitializerStorageWrapper)
    // -------------------------------------------------------------------------

    function createConfiguration(bytes32, FacetConfiguration[] calldata) external override {}

    function createBatchConfiguration(bytes32, FacetConfiguration[] calldata, bool) external override {}

    function cancelBatchConfiguration(bytes32) external override {}

    function checkResolverProxyConfigurationRegistered(bytes32, uint256) external view override {}

    function resolveResolverProxyCall(bytes32, uint256, bytes4) external view override returns (address) {
        return address(0);
    }

    function resolveSupportsInterface(bytes32, uint256, bytes4) external view override returns (bool) {
        return false;
    }

    function isResolverProxyConfigurationRegistered(bytes32, uint256) external view override returns (bool) {
        return false;
    }

    function getConfigurationsLength() external view override returns (uint256) {
        return 0;
    }

    function getConfigurations(uint256, uint256) external view override returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    function getLatestVersionByConfiguration(bytes32) external view override returns (uint256) {
        return 0;
    }

    function getFacetsByConfigurationIdAndVersion(
        bytes32,
        uint256,
        uint256,
        uint256
    ) external view override returns (IDiamondLoupe.Facet[] memory) {
        return new IDiamondLoupe.Facet[](0);
    }

    function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        bytes32,
        uint256,
        bytes32
    ) external view override returns (uint256) {
        return 0;
    }

    function getFacetSelectorsByConfigurationIdVersionAndFacetId(
        bytes32,
        uint256,
        bytes32,
        uint256,
        uint256
    ) external view override returns (bytes4[] memory) {
        return new bytes4[](0);
    }

    function getFacetIdsByConfigurationIdAndVersion(
        bytes32,
        uint256,
        uint256,
        uint256
    ) external view override returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    function getFacetConfigurationsByConfigurationIdAndVersion(
        bytes32,
        uint256,
        uint256,
        uint256
    ) external view override returns (FacetConfiguration[] memory) {
        return new FacetConfiguration[](0);
    }

    function getFacetAddressesByConfigurationIdAndVersion(
        bytes32,
        uint256,
        uint256,
        uint256
    ) external view override returns (address[] memory) {
        return new address[](0);
    }

    function getFacetIdByConfigurationIdVersionAndSelector(
        bytes32,
        uint256,
        bytes4
    ) external view override returns (bytes32) {
        return bytes32(0);
    }

    function getFacetVersionByConfigurationIdVersionAndFacetId(
        bytes32,
        uint256,
        bytes32
    ) external view override returns (uint256) {
        return 0;
    }

    function getFacetByConfigurationIdVersionAndFacetId(
        bytes32,
        uint256,
        bytes32
    ) external view override returns (IDiamondLoupe.Facet memory facet_) {
        facet_.id = bytes32(0);
        facet_.addr = address(0);
    }

    function getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32,
        uint256,
        bytes32
    ) external view override returns (address) {
        return address(0);
    }

    // -------------------------------------------------------------------------
    // IDiamondCutManager — implemented
    // -------------------------------------------------------------------------

    function getFacetsLengthByConfigurationIdAndVersion(
        bytes32,
        uint256
    ) external view override returns (uint256 facetsLength_) {
        return _facetsLength;
    }

    function getTransitionDiff(
        bytes32,
        uint256,
        bytes32,
        uint256
    ) external view override returns (uint256 totalFacets_, uint256 unchangedFacets_, bool isRegistered_) {
        return (_totalFacets, _unchangedFacets, _isRegistered);
    }
}
