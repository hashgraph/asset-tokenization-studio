// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/factory/IFactory.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

import { TRexIResolverProxy as IResolverProxy } from "./IResolverProxy.sol";
import { TRexIBusinessLogicResolver as IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { TRexICore as ICore } from "./ICore.sol";
import { TRexIBondRead as IBondRead } from "./IBondRead.sol";
import { TRexIEquity as IEquity } from "./IEquity.sol";
import { FactoryRegulationData, RegulationData, RegulationType, RegulationSubType } from "./regulation.sol";
import { TRexIFixedRate as IFixedRate } from "./IFixedRate.sol";
import { TRexIKpiLinkedRate as IKpiLinkedRate } from "./IKpiLinkedRate.sol";

/**
 * @title Factory Interface
 * @author Asset Tokenization Studio Team
 * @notice Interface for deploying tokenised securities (equity, bonds, loans)
 *         through a centralised factory that configures resolver proxies,
 *         business-logic resolvers, and role-based access control.
 */
interface TRexIFactory {
    enum SecurityType {
        BondVariableRate,
        Equity,
        BondFixedRate,
        BondKpiLinkedRate,
        Loan
    }

    struct ResolverProxyConfiguration {
        bytes32 key;
        uint256 version;
    }

    struct SecurityData {
        bool arePartitionsProtected;
        bool isMultiPartition;
        IBusinessLogicResolver resolver;
        ResolverProxyConfiguration resolverProxyConfiguration;
        IResolverProxy.Rbac[] rbacs;
        bool isControllable;
        bool isWhiteList;
        uint256 maxSupply;
        ICore.ERC20MetadataInfo erc20MetadataInfo;
        bool clearingActive;
        bool internalKycActivated;
        address[] externalPauses;
        address[] externalControlLists;
        address[] externalKycLists;
        bool erc20VotesActivated;
        address compliance;
        address identityRegistry;
    }

    struct EquityData {
        SecurityData security;
        IEquity.EquityDetailsData equityDetails;
    }

    struct BondData {
        SecurityData security;
        IBondRead.BondDetailsData bondDetails;
        address[] proceedRecipients;
        bytes[] proceedRecipientsData;
    }

    struct BondKpiLinkedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IKpiLinkedRate.InterestRate interestRate;
        IKpiLinkedRate.ImpactData impactData;
    }

    struct BondFixedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IFixedRate.FixedRateData fixedRateData;
    }

    /**
     * @notice Emitted when a new equity token is deployed.
     * @param deployer Address that initiated the deployment.
     * @param equityAddress Address of the newly deployed equity proxy.
     * @param equityData Full equity configuration supplied at deployment.
     * @param regulationData Regulation settings applied to the equity.
     */
    event EquityDeployed(
        address indexed deployer,
        address equityAddress,
        EquityData equityData,
        FactoryRegulationData regulationData
    );

    /**
     * @notice Emitted when a new variable-rate bond is deployed.
     * @param deployer Address that initiated the deployment.
     * @param bondAddress Address of the newly deployed bond proxy.
     * @param bondData Full bond configuration supplied at deployment.
     * @param regulationData Regulation settings applied to the bond.
     */
    event BondDeployed(
        address indexed deployer,
        address bondAddress,
        BondData bondData,
        FactoryRegulationData regulationData
    );

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

    /**
     * @notice Emitted when a new resolver proxy is deployed.
     * @param proxyAddress Address of the newly deployed proxy.
     * @param resolver Business-logic resolver attached to the proxy.
     * @param configKey Configuration identifier used by the proxy.
     * @param version Initial configuration version.
     * @param rbac Role-based access control entries seeded at deployment.
     */
    event ProxyDeployed(
        address indexed proxyAddress,
        IBusinessLogicResolver resolver,
        bytes32 configKey,
        uint256 version,
        IResolverProxy.Rbac[] rbac
    );

    error EmptyResolver(IBusinessLogicResolver resolver);
    error NoInitialAdmins();

    /**
     * @notice Deploys a new resolver proxy and initialises its RBAC.
     * @param _resolver Business-logic resolver to attach.
     * @param _configKey Configuration identifier for the proxy.
     * @param _version Initial configuration version.
     * @param _rbacs Role-based access control entries to seed.
     * @return proxyAddress_ Address of the deployed proxy.
     */
    function deployProxy(
        IBusinessLogicResolver _resolver,
        bytes32 _configKey,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbacs
    ) external returns (address proxyAddress_);

    /**
     * @notice Deploys a new equity token with the supplied data.
     * @param _equityData Equity configuration and metadata.
     * @param _factoryRegulationData Regulation settings for the equity.
     * @return equityAddress_ Address of the deployed equity proxy.
     */
    function deployEquity(
        EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address equityAddress_);

    /**
     * @notice Deploys a new variable-rate bond with the supplied data.
     * @param _bondData Bond configuration and metadata.
     * @param _factoryRegulationData Regulation settings for the bond.
     * @return bondAddress_ Address of the deployed bond proxy.
     */
    function deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address bondAddress_);

    /**
     * @notice Deploys a new fixed-rate bond with the supplied data.
     * @param _bondFixedRateData Full fixed-rate bond configuration.
     * @return bondAddress_ Address of the deployed bond proxy.
     */
    function deployBondFixedRate(BondFixedRateData calldata _bondFixedRateData) external returns (address bondAddress_);

    /**
     * @notice Deploys a new KPI-linked-rate bond with the supplied data.
     * @param _bondKpiLinkedRateData Full KPI-linked-rate bond configuration.
     * @return bondAddress_ Address of the deployed bond proxy.
     */
    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) external returns (address bondAddress_);

    /**
     * @notice Returns the regulation data that applies to a given type/sub-type pair.
     * @param _regulationType Primary regulation category.
     * @param _regulationSubType Sub-category within the regulation.
     * @return regulationData_ Matched regulation configuration.
     */
    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory regulationData_);
}
