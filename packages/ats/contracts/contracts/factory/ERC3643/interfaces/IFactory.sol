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

/// @custom:hash resolverKey Factory
bytes32 constant RESOLVER_KEY_FACTORY = 0x9fc26269cc1cb994e66f269ed6b58a5bb0c344a134b9dabd342ac466d48f95c7;

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
     * @notice Deploys a new resolver proxy and initializes its rbac
     */
    function deployProxy(
        IBusinessLogicResolver _resolver,
        bytes32 _configKey,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbacs
    ) external returns (address);

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

    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory regulationData_);
}
