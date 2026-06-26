// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Factory } from "../../factory/Factory.sol";
import { IFactory } from "../../factory/IFactory.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { IEvmAccessorsFacet } from "../testAccessors/IEvmAccessorsFacet.sol";
import { IMockDiamondCut } from "./MockDiamondCut.sol";
import { ResolverProxy } from "../../infrastructure/proxy/ResolverProxy.sol";
import { IResolverProxy } from "../../infrastructure/proxy/IResolverProxy.sol";
import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Mock Factory
 * @notice Test factory that deploys securities and marks their EVM accessor facet ready.
 * @dev Extends `Factory` for test environments. Token configurations append the test-only
 *      `EvmAccessorsFacet` (see `facetEnvironment.buildFacetList`); like every registered
 *      facet under the centralised initializer, it must be marked ready before the security
 *      reaches operational status. This override performs that one-shot initialisation right
 *      after the base deployment, while the factory still holds the temporary admin role.
 * @author Asset Tokenization Studio Team
 */
interface IMockFactory is IFactory {
    /// @notice Deploy a test-only asset diamond against the AssetMock configuration.
    /// @dev Mirrors `Factory._deploySecurityProxy` but force-readies every facet via
    ///      `MockDiamondCut.forceFacetsReady` instead of running per-facet initialisers.
    ///      The caller (test deployer) receives `DEFAULT_ADMIN_ROLE` on the proxy so per-suite test
    ///      configuration (forceNonOperational, etc.) remains possible.
    /// @param resolver_ The deployed BusinessLogicResolver (BLR) address.
    /// @return assetAddress_ Address of the freshly deployed, fully ready test asset proxy.
    function deployAssetMock(IBusinessLogicResolver resolver_) external returns (address assetAddress_);
}

/**
 * @title Mock Factory Implementation
 * @author Asset Tokenization Studio Team
 */
abstract contract MockFactory is Factory, IMockFactory {
    /// @notice Resolver configuration ID that registers the full IAsset facet union.
    /// @dev Every asset-class facet set, deduplicated (it remains the complete union even though
    ///      only equity, bond and depositToken are deployable through the factory), with
    ///      DiamondFacet swapped for MockDiamondCut and EvmAccessorsFacet appended. Created by the
    ///      TypeScript-side `createAssetMockConfiguration` at infrastructure deploy time.
    ///      Value: 0x000000000000000000000000000000000000000000000000000000000000000a
    bytes32 private constant _ASSET_MOCK_CONFIG_ID = 0x000000000000000000000000000000000000000000000000000000000000000a;

    /// @inheritdoc IMockFactory
    function deployAssetMock(IBusinessLogicResolver resolver_) external returns (address assetAddress_) {
        // 1. Build RBAC: seed the caller as temporary DEFAULT_ADMIN_ROLE holder
        IResolverProxy.Rbac[] memory rbacs = new IResolverProxy.Rbac[](1);
        rbacs[0] = IResolverProxy.Rbac({ role: DEFAULT_ADMIN_ROLE, members: new address[](1) });
        rbacs[0].members[0] = EvmAccessors.getMsgSender();

        // 2. Deploy a bare ResolverProxy against ASSET_MOCK_CONFIG_ID, version 1.
        //    Mirrors Factory._deploySecurityProxy but creates the proxy directly
        //    without the SecurityData indirection (no ISIN, regulation, etc.).
        IResolverProxy.ResolverProxyConfigurationV2 memory resolverProxyConfig = IResolverProxy
            .ResolverProxyConfigurationV2({
                configurationId: _ASSET_MOCK_CONFIG_ID,
                configurationVersion: 1,
                replacementEnabled: false
            });
        ResolverProxy proxy = new ResolverProxy(resolver_, resolverProxyConfig, rbacs);
        assetAddress_ = address(proxy);

        // 3. Read the full facet list from the BLR for the AssetMock config
        uint256 facetsLen = resolver_.getFacetsLengthByConfigurationIdAndVersion(_ASSET_MOCK_CONFIG_ID, 1);
        bytes32[] memory facetIds = resolver_.getFacetIdsByConfigurationIdAndVersion(
            _ASSET_MOCK_CONFIG_ID,
            1,
            0,
            facetsLen
        );

        // 4. Force every facet to READY status — skips per-facet initialisers.
        //    This includes EvmAccessorsFacet (part of the full union), so the
        //    explicit initializeEvmAccessors() call from the production path is
        //    redundant here.
        IMockDiamondCut(assetAddress_).forceFacetsReady(facetIds);

        // 5. Mark the proxy operational.  We use `forceSetOperational` (a mock
        //    control) instead of the production `IInitializer.setOperationalStatus`
        //    because that function requires `maxInitializerFacetIndex` to be seeded
        //    on the proxy first — something the production path does via
        //    `IInitializer.initializeInitializer(150)`, which cannot be called here
        //    because `forceFacetsReady` already marked the InitializerFacet.
        //    Since every facet is already READY, direct status-setting is equivalent.
        IMockDiamondCut(assetAddress_).forceSetOperational();

        // 6. Do NOT renounce DEFAULT_ADMIN_ROLE — the caller needs it for
        //    per-suite reconfiguration (forceNonOperational, etc.).
    }

    /// @inheritdoc Factory
    /// @dev Marks the EVM accessor facet ready on the freshly deployed security.
    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal override returns (address securityAddress_) {
        securityAddress_ = super._deploySecurity(_securityData, _securityType);
        IEvmAccessorsFacet(securityAddress_).initializeEvmAccessors();
    }

    /// @inheritdoc Factory
    /// @dev Marks the EVM accessor facet ready on the freshly deployed deposit token.
    function _deployDepositToken(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal override returns (address securityAddress_) {
        securityAddress_ = super._deployDepositToken(_securityData, _securityType);
        IEvmAccessorsFacet(securityAddress_).initializeEvmAccessors();
    }
}
