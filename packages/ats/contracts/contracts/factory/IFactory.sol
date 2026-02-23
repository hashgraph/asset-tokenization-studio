// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IResolverProxy } from "../infrastructure/interfaces/IResolverProxy.sol";
import { IBusinessLogicResolver } from "../infrastructure/interfaces/IBusinessLogicResolver.sol";
import { IERC20 } from "../facets/features/interfaces/ERC1400/IERC20.sol";
import { IBondRead } from "../facets/assetCapabilities/interfaces/bond/IBondRead.sol";
import { IEquity } from "../facets/assetCapabilities/interfaces/equity/IEquity.sol";
import {
    FactoryRegulationData,
    RegulationData,
    RegulationType,
    RegulationSubType
} from "../lib/domain/LibRegulation.sol";
import { IFixedRate } from "../facets/assetCapabilities/interfaces/interestRates/fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "../facets/assetCapabilities/interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
// solhint-disable max-line-length
import {
    ISustainabilityPerformanceTargetRate
} from "../facets/assetCapabilities/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
// solhint-enable max-line-length

interface IFactory {
    enum SecurityType {
        BondVariableRate,
        Equity,
        BondFixedRate,
        BondKpiLinkedRate,
        BondSPTRate
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
        IERC20.ERC20MetadataInfo erc20MetadataInfo;
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

    struct BondSustainabilityPerformanceTargetRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        ISustainabilityPerformanceTargetRate.InterestRate interestRate;
        ISustainabilityPerformanceTargetRate.ImpactData[] impactData;
        address[] projects;
    }

    struct BondFixedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IFixedRate.FixedRateData fixedRateData;
    }

    event EquityDeployed(
        address indexed deployer,
        address equityAddress,
        EquityData equityData,
        FactoryRegulationData regulationData
    );

    event BondDeployed(
        address indexed deployer,
        address bondAddress,
        BondData bondData,
        FactoryRegulationData regulationData
    );

    event BondFixedRateDeployed(address indexed deployer, address bondAddress, BondFixedRateData bondFixedRateData);

    event BondKpiLinkedRateDeployed(
        address indexed deployer,
        address bondAddress,
        BondKpiLinkedRateData bondKpiLinkedRateData
    );

    event BondSustainabilityPerformanceTargetRateDeployed(
        address indexed deployer,
        address bondAddress,
        BondSustainabilityPerformanceTargetRateData bondSustainabilityPerformanceTargetRateData
    );

    error EmptyResolver(IBusinessLogicResolver resolver);
    error NoInitialAdmins();

    /**
     * @notice Deploys a new equity given the input equity data
     */
    function deployEquity(
        EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address equityAddress_);

    /**
     * @notice Deploys a new equity given the input equity data
     */
    function deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address bondAddress_);

    function deployBondFixedRate(BondFixedRateData calldata _bondFixedRateData) external returns (address bondAddress_);

    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) external returns (address bondAddress_);

    function deployBondSustainabilityPerformanceTargetRate(
        BondSustainabilityPerformanceTargetRateData calldata _bondSustainabilityPerformanceTargetRateData
    ) external returns (address bondAddress_);

    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory regulationData_);
}
