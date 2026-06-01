// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { IBusinessLogicResolver } from "../infrastructure/diamond/IBusinessLogicResolver.sol";
import { ICore } from "../facets/core/ICore.sol";
import { IBondRead } from "../facets/layer_2/bond/IBondRead.sol";
import { IEquity } from "../facets/layer_2/equity/IEquity.sol";
import { FactoryRegulationData, RegulationData, RegulationType, RegulationSubType } from "../constants/regulation.sol";
import { IFixedRate } from "../facets/layer_2/interestRate/fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";

/// @custom:hash resolverKey Factory
bytes32 constant RESOLVER_KEY_FACTORY = 0x9fc26269cc1cb994e66f269ed6b58a5bb0c344a134b9dabd342ac466d48f95c7;

/**
 * @title Factory Interface
 * @author Asset Tokenization Studio Team
 * @notice Interface for deploying tokenised securities (equity, bonds, loans)
 *         through a centralised factory that configures resolver proxies,
 *         business-logic resolvers, and role-based access control.
 */
interface IFactory {
    /**
     * @notice Distinguishes the security variant being deployed.
     * @dev Used internally to select the correct initialisation path in the factory.
     */
    enum SecurityType {
        /// @notice A bond whose coupon rate floats against an external index.
        BondVariableRate,
        /// @notice An equity instrument (shares).
        Equity,
        /// @notice A bond with a fixed coupon rate.
        BondFixedRate,
        /// @notice A bond whose coupon is tied to KPI performance metrics.
        BondKpiLinkedRate,
        /// @notice A loan instrument.
        Loan,
        DepositToken
    }

    /**
     * @notice Identifies the business-logic resolver version to wire into a new proxy.
     * @param key     Resolver key that maps to the registered BusinessLogicResolver address.
     * @param version Configuration version to load from the resolver.
     */
    struct ResolverProxyConfiguration {
        bytes32 key;
        uint256 version;
    }

    /**
     * @notice Core configuration shared across all security types.
     * @dev Passed verbatim to the proxy initialiser; all addresses must be non-zero where
     *      the corresponding feature is activated.
     * @param arePartitionsProtected     Whether token partitions are protected from arbitrary transfer.
     * @param isMultiPartition           Whether the token supports multiple partitions.
     * @param resolver                   BusinessLogicResolver that backs the new Diamond proxy.
     * @param resolverProxyConfiguration Resolver key and version used during deployment.
     * @param rbacs                      Initial role assignments applied at proxy creation.
     * @param isControllable             Whether an operator can forcibly transfer tokens.
     * @param isWhiteList                Whether transfers are gated by a whitelist.
     * @param maxSupply                  Hard cap on total token supply (0 means unlimited).
     * @param erc20MetadataInfo          ERC-20 name, symbol, and decimals.
     * @param clearingActive             Whether clearing and settlement is activated.
     * @param internalKycActivated       Whether the internal KYC module is activated.
     * @param externalPauses             External pause contract addresses consulted on transfer.
     * @param externalControlLists       External control-list contract addresses.
     * @param externalKycLists           External KYC-list contract addresses.
     * @param erc20VotesActivated        Whether ERC-20 vote delegation is activated.
     * @param compliance                 Address of the compliance contract (address(0) to disable).
     * @param identityRegistry           Address of the identity registry (address(0) to disable).
     */
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

    /**
     * @notice Full configuration for deploying an equity token.
     * @param security      Core security configuration shared across all security types.
     * @param equityDetails Equity-specific details such as dividend type and voting rights.
     */
    struct EquityData {
        SecurityData security;
        IEquity.EquityDetailsData equityDetails;
    }

    /**
     * @notice Full configuration for deploying a bond token.
     * @param security              Core security configuration shared across all security types.
     * @param bondDetails           Bond-specific details such as maturity date and nominal value.
     * @param proceedRecipients     Addresses that receive the bond proceeds at issuance.
     * @param proceedRecipientsData ABI-encoded data forwarded to each proceed recipient.
     */
    struct BondData {
        SecurityData security;
        IBondRead.BondDetailsData bondDetails;
        address[] proceedRecipients;
        bytes[] proceedRecipientsData;
    }

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

    struct DepositTokenData {
        SecurityData security;
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
    event DepositTokenDeployed(
        address indexed deployer,
        address depositTokenAddress,
        DepositTokenData depositTokenData,
        FactoryRegulationData regulationData
    );

    event ProxyDeployed(
        address indexed proxyAddress,
        IBusinessLogicResolver resolver,
        bytes32 configKey,
        uint256 version,
        IResolverProxy.Rbac[] rbac
    );

    /**
     * @notice Raised when the supplied resolver address is the zero address.
     * @param resolver The zero-address resolver that caused the revert.
     */
    error EmptyResolver(IBusinessLogicResolver resolver);

    /**
     * @notice Raised when no admin role assignments are provided for the new proxy.
     */
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
     * @notice Deploys a new deposit token given the input deposit token data
     */
    function deployDepositToken(
        DepositTokenData calldata _depositTokenData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address depositTokenAddress_);

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
