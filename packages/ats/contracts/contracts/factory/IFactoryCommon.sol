// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { IBusinessLogicResolver } from "../infrastructure/diamond/IBusinessLogicResolver.sol";
import { ICore } from "../facets/core/ICore.sol";
import { FactoryRegulationData, RegulationType, RegulationSubType } from "../constants/regulation.sol";

/**
 * @title IFactoryCommon
 * @author Asset Tokenization Studio Team
 * @notice Shared factory type system: the enums, structs, deployment events and errors used by
 *         every factory facet.
 * @dev Split out of `IFactory` so each facet interface (`IFactoryEquityBond`, `IDepositTokenFactory`)
 *      and the shared `FactoryCommon` base reuse the same types without inheriting deployment
 *      functions they do not implement. The concrete `IFactory` union still exposes every type via
 *      inheritance, so off-chain consumers keep using `IFactory.SecurityData` unchanged.
 */
interface IFactoryCommon {
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
     * @notice Categories of dividend entitlement an equity token may carry.
     */
    enum DividendType {
        /// No dividend right.
        NONE,
        /// Preferential dividend — paid before common holders.
        PREFERRED,
        /// Ordinary dividend distributed pro-rata across common holders.
        COMMON
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
        IBusinessLogicResolver resolver;
        uint256 maxSupply;
        ResolverProxyConfiguration resolverProxyConfiguration;
        ICore.ERC20MetadataInfo erc20MetadataInfo;
        IResolverProxy.Rbac[] rbacs;
        address[] externalPauses;
        address[] externalControlLists;
        address[] externalKycLists;
        address compliance;
        address identityRegistry;
        bool arePartitionsProtected;
        bool isMultiPartition;
        bool isControllable;
        bool isWhiteList;
        bool clearingActive;
        bool internalKycActivated;
        bool erc20VotesActivated;
    }

    /**
     * @notice Economic and rights parameters specific to equity tokens.
     * @param votingRight          Whether holders carry voting rights.
     * @param informationRight     Whether holders are entitled to company information.
     * @param liquidationRight     Whether holders have a claim on assets upon liquidation.
     * @param subscriptionRight    Whether holders may subscribe to new issuances.
     * @param conversionRight      Whether holders may convert their tokens into another class.
     * @param redemptionRight      Whether holders may redeem tokens for the underlying asset.
     * @param putRight             Whether holders may force the issuer to repurchase tokens.
     * @param dividendRight        Category of dividend entitlement this equity class carries.
     * @param currency             ISO 4217 currency code encoded as `bytes3`.
     * @param nominalValue         Face value of one equity unit (raw integer).
     * @param nominalValueDecimals Number of decimal places applied to `nominalValue`.
     */
    struct EquityDetailsData {
        bool votingRight;
        bool informationRight;
        bool liquidationRight;
        bool subscriptionRight;
        bool conversionRight;
        bool redemptionRight;
        bool putRight;
        DividendType dividendRight;
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
    }

    /**
     * @notice Full configuration for deploying an equity token.
     * @param security      Core security configuration shared across all security types.
     * @param equityDetails Equity-specific details such as dividend type and voting rights.
     */
    struct EquityData {
        SecurityData security;
        EquityDetailsData equityDetails;
    }

    /**
     * @notice Input data describing a bond's economic parameters.
     * @dev    Replaces the removed `IBondRead.BondDetailsData` type. Consumed by the Factory
     *         during `deployBond`, `deployBondFixedRate`, and `deployBondKpiLinkedRate`.
     * @param currency               ISO 4217 currency code encoded as `bytes3`.
     * @param nominalValue           Face value of one unit of the bond (raw integer).
     * @param nominalValueDecimals   Number of decimals applied to `nominalValue`.
     * @param startingDate           Bond issuance / start-of-coupon-accrual timestamp (Unix epoch,
     *                               seconds). Persisted as metadata under
     *                               `BOND_STARTING_DATE_METADATA_KEY`.
     * @param maturityDate           Redemption date timestamp (Unix epoch, seconds). Must be
     *                               strictly greater than `startingDate`.
     */
    struct BondDetailsData {
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
        uint256 startingDate;
        uint256 maturityDate;
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
        BondDetailsData bondDetails;
        address[] proceedRecipients;
        bytes[] proceedRecipientsData;
    }

    /**
     * @notice Full configuration for deploying a deposit token.
     * @param security Core security configuration shared across all security types.
     */
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
     * @notice Emitted when a new deposit token is deployed.
     * @param deployer Address that initiated the deployment.
     * @param depositTokenAddress Address of the newly deployed deposit token proxy.
     * @param depositTokenData Full deposit token configuration.
     * @param regulationData Regulation data validated for the deposit token.
     */
    event DepositTokenDeployed(
        address indexed deployer,
        address depositTokenAddress,
        DepositTokenData depositTokenData,
        FactoryRegulationData regulationData
    );

    /**
     * @notice Emitted when a new resolver proxy is deployed.
     * @param proxyAddress Address of the newly deployed proxy.
     * @param resolver Business-logic resolver attached to the proxy.
     * @param configKey Configuration identifier used by the proxy.
     * @param version Initial configuration version.
     * @param rbac Role-based access control entries seeded at deployment.
     * @param data Additional data for the proxy deployment.
     */
    event ProxyDeployed(
        address indexed proxyAddress,
        IBusinessLogicResolver resolver,
        bytes32 configKey,
        uint256 version,
        IResolverProxy.Rbac[] rbac,
        bytes data
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
     * @notice Raised when the provided ISIN does not meet the expected format or length.
     * @param isin The invalid ISIN string.
     */
    error WrongISIN(string isin);

    /**
     * @notice Raised when the ISIN checksum is invalid.
     * @param isin The invalid ISIN string.
     */
    error WrongISINChecksum(string isin);

    /**
     * @notice Raised when the requested regulation type and sub-type combination is not permitted.
     * @param regulationType Primary regulation category.
     * @param regulationSubType Sub-category within the regulation.
     */
    error RegulationTypeAndSubTypeForbidden(RegulationType regulationType, RegulationSubType regulationSubType);
}
