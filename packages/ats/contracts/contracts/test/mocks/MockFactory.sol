// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Factory } from "../../factory/Factory.sol";
import { IFactory, FactoryRegulationData } from "../../factory/IFactory.sol";
import { IInterestRate } from "../../facets/interestRate/IInterestRate.sol";
import { IInitializer } from "../../facets/initializer/IInitializer.sol";
import { IAccessControl } from "../../facets/accessControl/IAccessControl.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { FACTORY_OPERATIONAL_STATUS } from "../../constants/values.sol";
import { IKpis } from "../../facets/kpi/IKpis.sol";
import { IFixedRate } from "../../facets/fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "../../facets/kpiLinkedRate/IKpiLinkedRate.sol";
import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";
import { IEvmAccessorsFacet } from "../testAccessors/IEvmAccessorsFacet.sol";
import { IDiamondCutManager } from "../../infrastructure/diamond/IDiamondCutManager.sol";
import { IMockDiamondCut } from "./MockDiamondCut.sol";
import { ResolverProxy } from "../../infrastructure/proxy/ResolverProxy.sol";
import { IResolverProxy } from "../../infrastructure/proxy/IResolverProxy.sol";
import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";

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
    /**
     * @notice Full configuration for deploying a KPI-linked-rate bond.
     * @param bondData              Base bond configuration.
     * @param factoryRegulationData Regulatory classification applied at deployment.
     * @param interestRate          Initial KPI-linked interest-rate parameters.
     * @param impactData            KPI impact metrics used to compute the variable coupon.
     */
    struct BondKpiLinkedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IKpiLinkedRate.InterestRate interestRate;
        IKpiLinkedRate.ImpactData impactData;
    }

    /**
     * @notice Full configuration for deploying a fixed-rate bond.
     * @param bondData              Base bond configuration.
     * @param factoryRegulationData Regulatory classification applied at deployment.
     * @param fixedRateData         Fixed coupon rate and day-count convention parameters.
     */
    struct BondFixedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IFixedRate.FixedRateData fixedRateData;
    }

    /**
     * @notice Emitted when a new fixed-rate bond is deployed.
     * @param deployer Address that initiated the deployment.
     * @param bondAddress Address of the newly deployed bond proxy.
     * @param bondFixedRateData Full fixed-rate bond configuration.
     */
    event BondFixedRateDeployed(address indexed deployer, address bondAddress, BondFixedRateData bondFixedRateData);

    /**
     * @notice Emitted when a new KPI-linked-rate bond is deployed.
     * @param deployer Address that initiated the deployment.
     * @param bondAddress Address of the newly deployed bond proxy.
     * @param bondKpiLinkedRateData Full KPI-linked-rate bond configuration.
     */
    event BondKpiLinkedRateDeployed(
        address indexed deployer,
        address bondAddress,
        BondKpiLinkedRateData bondKpiLinkedRateData
    );

    /// @notice Thrown when the supplied interest-rate parameters violate ordering invariants
    ///         (e.g. `minRate > baseRate` or `baseRate > maxRate`).
    error WrongInterestRateValues(IKpiLinkedRate.InterestRate interestRate);

    /// @notice Thrown when the supplied KPI impact-data parameters violate ordering invariants
    ///         (e.g. `maxDeviationFloor >= baseLine` or `baseLine >= maxDeviationCap`).
    error WrongImpactDataValues(IKpiLinkedRate.ImpactData impactData);

    /**
     * @notice Deploys and initialises a fixed-rate bond security proxy.
     * @dev Validates resolver, admin RBAC, regulation data and bond dates. Initialises
     *      bond-specific and fixed-rate facets, marks the proxy operational, renounces this
     *      factory's temporary admin role and emits `BondFixedRateDeployed`.
     * @param _bondFixedRateData Fixed-rate bond deployment, regulation and rate data.
     * @return bondAddress_ Address of the deployed fixed-rate bond proxy.
     */
    function deployBondFixedRate(BondFixedRateData calldata _bondFixedRateData) external returns (address bondAddress_);

    /**
     * @notice Deploys and initialises a KPI-linked-rate bond security proxy.
     * @dev Validates resolver, admin RBAC, regulation data, bond dates, interest-rate
     *      and impact data. Initialises bond-specific and KPI facets, marks the proxy
     *      operational, renounces this factory's temporary admin role and emits
     *      `BondKpiLinkedRateDeployed`.
     * @param _bondKpiLinkedRateData KPI-linked-rate bond deployment, regulation, rate and impact data.
     * @return bondAddress_ Address of the deployed KPI-linked-rate bond proxy.
     */
    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) external returns (address bondAddress_);

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
    /// @dev All 7 asset-class facet sets (equity, bond, bondFixedRate, bondKpiLinkedRate,
    ///      loan, loansPortfolio, depositToken) with DiamondFacet swapped for MockDiamondCut
    ///      and EvmAccessorsFacet appended. Created by the TypeScript-side
    ///      `createAssetMockConfiguration` at infrastructure deploy time.
    ///      Value: 0x000000000000000000000000000000000000000000000000000000000000000a
    bytes32 private constant _ASSET_MOCK_CONFIG_ID = 0x000000000000000000000000000000000000000000000000000000000000000a;

    /**
     * @notice Guarantees KPI-linked interest rate data is valid before deployment.
     * @dev Delegates to `_checkInterestRate`, which reverts for invalid interest-rate data.
     * @param _newInterestRate KPI-linked interest rate configuration to validate.
     */
    modifier onlyValidInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        _checkInterestRate(_newInterestRate);
        _;
    }

    /**
     * @notice Guarantees KPI impact data is valid before deployment.
     * @dev Delegates to `_checkImpactData`, which reverts for invalid impact data.
     * @param _newImpactData KPI impact configuration to validate.
     */
    modifier onlyValidImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        _checkImpactData(_newImpactData);
        _;
    }

    /**
     * @notice Deploys and initialises a fixed-rate bond security proxy.
     * @dev Validates resolver, admin RBAC, regulation data and bond dates. Initialises
     *      bond-specific and fixed-rate facets, marks the proxy operational, renounces this
     *      factory's temporary admin role and emits `BondFixedRateDeployed`.
     * @param _bondFixedRateData Fixed-rate bond deployment, regulation and rate data.
     * @return bondAddress_ Address of the deployed fixed-rate bond proxy.
     */
    function deployBondFixedRate(
        BondFixedRateData calldata _bondFixedRateData
    )
        external
        onlyValidResolver(_bondFixedRateData.bondData.security.resolver)
        onlyValidAdmins(_bondFixedRateData.bondData.security.rbacs)
        onlyValidRegulation(
            _bondFixedRateData.factoryRegulationData.regulationType,
            _bondFixedRateData.factoryRegulationData.regulationSubType
        )
        onlyValidBondDates(
            _bondFixedRateData.bondData.bondDetails.startingDate,
            _bondFixedRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBond(_bondFixedRateData.bondData, SecurityType.BondFixedRate);
        IFixedRate(bondAddress_).initializeFixedRate(_bondFixedRateData.fixedRateData);
        IInterestRate(bondAddress_).initializeInterestRateType(IInterestRate.RateType.FIXED);
        (bool isOperational_, ) = IInitializer(bondAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        emit BondFixedRateDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondFixedRateData);
    }

    /**
     * @notice Deploys and initialises a KPI-linked-rate bond security proxy.
     * @dev Validates resolver, admin RBAC, regulation data, KPI rate data, impact data
     *      and bond dates. Initialises bond-specific and KPI-linked facets, marks the proxy
     *      operational, renounces this factory's temporary admin role and emits
     *      `BondKpiLinkedRateDeployed`.
     * @param _bondKpiLinkedRateData KPI-linked bond deployment, regulation and rate data.
     * @return bondAddress_ Address of the deployed KPI-linked-rate bond proxy.
     */
    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    )
        external
        onlyValidResolver(_bondKpiLinkedRateData.bondData.security.resolver)
        onlyValidAdmins(_bondKpiLinkedRateData.bondData.security.rbacs)
        onlyValidRegulation(
            _bondKpiLinkedRateData.factoryRegulationData.regulationType,
            _bondKpiLinkedRateData.factoryRegulationData.regulationSubType
        )
        onlyValidInterestRate(_bondKpiLinkedRateData.interestRate)
        onlyValidImpactData(_bondKpiLinkedRateData.impactData)
        onlyValidBondDates(
            _bondKpiLinkedRateData.bondData.bondDetails.startingDate,
            _bondKpiLinkedRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBondKpiLinkedRate(_bondKpiLinkedRateData);
        (bool isOperational_, ) = IInitializer(bondAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        _emitBondKpiLinkedRateDeployed(bondAddress_, _bondKpiLinkedRateData);
    }

    // ── Test-only: deploy a diamond proxy against AssetMock config ──────────

    /// @inheritdoc IMockFactory
    function deployAssetMock(IBusinessLogicResolver resolver_) external returns (address assetAddress_) {
        // 1. Build RBAC: seed the caller as temporary DEFAULT_ADMIN_ROLE holder
        IResolverProxy.Rbac[] memory rbacs = new IResolverProxy.Rbac[](1);
        rbacs[0] = IResolverProxy.Rbac({ role: DEFAULT_ADMIN_ROLE, members: new address[](1) });
        rbacs[0].members[0] = msg.sender;

        // 2. Deploy a bare ResolverProxy against ASSET_MOCK_CONFIG_ID, version 1.
        //    Mirrors Factory._deploySecurityProxy but creates the proxy directly
        //    without the SecurityData indirection (no ISIN, regulation, etc.).
        ResolverProxy proxy = new ResolverProxy(resolver_, _ASSET_MOCK_CONFIG_ID, 1, rbacs);
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

    /**
     * @notice Deploys and initialises the KPI-linked-rate bond facet set.
     * @dev Builds on `_deployBond`, then initialises KPI-linked rate metadata, rate type and
     *      KPI tracking. Operational status and admin renouncement remain caller concerns.
     * @param _data KPI-linked bond deployment data.
     * @return bondAddress_ Address of the deployed KPI-linked-rate bond proxy.
     */
    function _deployBondKpiLinkedRate(BondKpiLinkedRateData calldata _data) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, SecurityType.BondKpiLinkedRate);
        IKpiLinkedRate(bondAddress_).initializeKpiLinkedRate(_data.interestRate, _data.impactData);
        IInterestRate(bondAddress_).initializeInterestRateType(IInterestRate.RateType.KPI_LINKED);
        IKpis(bondAddress_).initializeKpis();
    }

    /**
     * @notice Emits the KPI-linked-rate bond deployment event.
     * @dev Uses `EvmAccessors.getMsgSender()` so the emitted deployer follows the project's
     *      message-sender abstraction.
     * @param _bondAddress Address of the deployed KPI-linked-rate bond proxy.
     * @param _bondKpiLinkedRateData KPI-linked bond deployment data emitted for indexing.
     */
    function _emitBondKpiLinkedRateDeployed(
        address _bondAddress,
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) private {
        emit BondKpiLinkedRateDeployed(EvmAccessors.getMsgSender(), _bondAddress, _bondKpiLinkedRateData);
    }

    /**
     * @notice Asserts that KPI-linked interest rate data is valid.
     * @dev Forwards to `InterestRateStorageWrapper.requireValidInterestRate`, which reverts for
     *      invalid interest-rate data.
     * @param _newInterestRate KPI-linked interest rate configuration to validate.
     */
    function _checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) private pure {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
    }

    /**
     * @notice Asserts that KPI impact data is valid.
     * @dev Forwards to `InterestRateStorageWrapper.requireValidImpactData`, which reverts for
     *      invalid impact data.
     * @param _newImpactData KPI impact configuration to validate.
     */
    function _checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) private pure {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
    }
}
