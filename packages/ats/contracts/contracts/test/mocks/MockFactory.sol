// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Factory } from "../../factory/Factory.sol";
import { IFactory, FactoryRegulationData } from "../../factory/IFactory.sol";
import { ITimeTravel } from "../testTimeTravel/ITimeTravel.sol";
import { IInterestRate } from "../../facets/interestRate/IInterestRate.sol";
import { IInitializer } from "../../facets/initializer/IInitializer.sol";
import { IAccessControl } from "../../facets/accessControl/IAccessControl.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { FACTORY_OPERATIONAL_STATUS } from "../../constants/values.sol";
import { IKpis } from "../../facets/kpis/IKpis.sol";
import { IFixedRate } from "../../facets/fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "../../facets/kpiLinkedRate/IKpiLinkedRate.sol";
import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";
import { IDiamondCutManager } from "../../infrastructure/diamond/IDiamondCutManager.sol";
import { IMockDiamondCut } from "./MockDiamondCut.sol";
import { ResolverProxy } from "../../infrastructure/proxy/ResolverProxy.sol";
import { IResolverProxy } from "../../infrastructure/proxy/IResolverProxy.sol";
import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";

/**
 * @title Mock Factory
 * @notice Test factory that deploys securities and initialises their time-travel support.
 * @dev Extends `Factory` for test environments where deployed securities expose `ITimeTravel`.
 *      The deployed security must implement `initializeTimeTravel`, otherwise deployment reverts.
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
    /// @dev All asset-class facet sets (equity, bond, depositToken) with DiamondFacet swapped
    ///      for MockDiamondCut and EvmAccessorsFacet appended. Created by the TypeScript-side
    ///      `createAssetMockConfiguration` at infrastructure deploy time.
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
    /// @notice Deploys a security proxy and initialises time-travel state.
    /// @dev Initialises time-travel state on the deployed security after the base deployment.
    /// @param _securityData Core security configuration shared across all security types.
    /// @param _securityType Distinguishes the security variant being deployed.
    /// @return securityAddress_ Address of the deployed security proxy.
    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal override returns (address securityAddress_) {
        securityAddress_ = super._deploySecurity(_securityData, _securityType);
        ITimeTravel(securityAddress_).initializeTimeTravel();
    }
}
