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
// prettier-ignore
/* solhint-disable max-line-length */
import {TRexISustainabilityPerformanceTargetRate as ISustainabilityPerformanceTargetRate} from "./ISustainabilityPerformanceTargetRate.sol";
/* solhint-enable max-line-length */

/**
 * @title Factory Interface
 * @author Asset Tokenization Studio Team
 * @notice Entry point for deploying tokenised assets (equities, bonds with
 *         various interest rate models). Defines the data structures, events,
 *         and external functions that every factory implementation must satisfy.
 * @dev The factory deploys diamond-proxy tokens, each backed by a
 *      BusinessLogicResolver configuration. Security types are discriminated
 *      via the SecurityType enum; structured data payloads vary by type.
 *      Regulation metadata is attached for compliance purposes.
 */
interface TRexIFactory {
    /// @notice Discriminator for the type of asset to be deployed.
    /// @dev Each variant maps to a structured data payload and a distinct
    ///      set of facets in the resolver configuration.
    enum SecurityType {
        BondVariableRate,
        Equity,
        BondFixedRate,
        BondKpiLinkedRate,
        BondSPTRate,
        Loan
    }

    /// @notice Identifies the resolver configuration to use for a deployed
    ///         proxy token.
    struct ResolverProxyConfiguration {
        bytes32 key;
        uint256 version;
    }

    /// @notice Core security token parameters shared by all asset types.
    /// @param arePartitionsProtected Whether ERC-1410 partitions enforce role
    ///        gating.
    /// @param isMultiPartition Whether the token uses multiple partitions.
    /// @param resolver The BusinessLogicResolver instance that provides the
    ///        facet registry.
    /// @param resolverProxyConfiguration Key and version of the resolver
    ///        configuration.
    /// @param rbacs Initial RBAC definitions for the proxy.
    /// @param isControllable Whether controller (forced-transfer) capabilities
    ///        are enabled.
    /// @param isWhiteList Whether transfers are restricted to a whitelist.
    /// @param maxSupply Maximum token supply (0 = unlimited).
    /// @param erc20MetadataInfo ERC-20 name and symbol.
    /// @param clearingActive Whether clearing holds are active on deployment.
    /// @param internalKycActivated Whether KYC is managed internally.
    /// @param externalPauses Addresses of external pause contracts.
    /// @param externalControlLists Addresses of external control-list
    ///        contracts.
    /// @param externalKycLists Addresses of external KYC-list contracts.
    /// @param erc20VotesActivated Whether ERC-20 delegation/voting is
    ///        enabled.
    /// @param compliance Compliance contract address.
    /// @param identityRegistry Identity registry contract address.
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

    /// @notice Payload for deploying an equity token.
    struct EquityData {
        SecurityData security;
        IEquity.EquityDetailsData equityDetails;
    }

    /// @notice Payload for deploying a variable-rate bond token.
    struct BondData {
        SecurityData security;
        IBondRead.BondDetailsData bondDetails;
        address[] proceedRecipients;
        bytes[] proceedRecipientsData;
    }

    /// @notice Payload for deploying a KPI-linked rate bond token.
    struct BondKpiLinkedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IKpiLinkedRate.InterestRate interestRate;
        IKpiLinkedRate.ImpactData impactData;
    }

    /// @notice Payload for deploying a sustainability performance target rate
    ///         (SPT) bond token.
    struct BondSustainabilityPerformanceTargetRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        ISustainabilityPerformanceTargetRate.InterestRate interestRate;
        ISustainabilityPerformanceTargetRate.ImpactData[] impactData;
        address[] projects;
    }

    /// @notice Payload for deploying a fixed-rate bond token.
    struct BondFixedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IFixedRate.FixedRateData fixedRateData;
    }

    /// @notice Emitted when an equity token has been deployed.
    /// @param deployer Address that triggered the deployment.
    /// @param equityAddress Address of the newly deployed equity token proxy.
    /// @param equityData Equity deployment payload.
    /// @param regulationData Regulation metadata attached to the security.
    event EquityDeployed(
        address indexed deployer,
        address equityAddress,
        EquityData equityData,
        FactoryRegulationData regulationData
    );

    /// @notice Emitted when a variable-rate bond token has been deployed.
    /// @param deployer Address that triggered the deployment.
    /// @param bondAddress Address of the newly deployed bond token proxy.
    /// @param bondData Bond deployment payload.
    /// @param regulationData Regulation metadata attached to the security.
    event BondDeployed(
        address indexed deployer,
        address bondAddress,
        BondData bondData,
        FactoryRegulationData regulationData
    );

    /// @notice Emitted when a fixed-rate bond token has been deployed.
    /// @param deployer Address that triggered the deployment.
    /// @param bondAddress Address of the newly deployed bond token proxy.
    /// @param bondFixedRateData Fixed-rate bond deployment payload.
    event BondFixedRateDeployed(address indexed deployer, address bondAddress, BondFixedRateData bondFixedRateData);

    /// @notice Emitted when a KPI-linked rate bond token has been deployed.
    /// @param deployer Address that triggered the deployment.
    /// @param bondAddress Address of the newly deployed bond token proxy.
    /// @param bondKpiLinkedRateData KPI-linked rate bond deployment payload.
    event BondKpiLinkedRateDeployed(
        address indexed deployer,
        address bondAddress,
        BondKpiLinkedRateData bondKpiLinkedRateData
    );

    /// @notice Emitted when a sustainability performance target rate bond
    ///         token has been deployed.
    /// @param deployer Address that triggered the deployment.
    /// @param bondAddress Address of the newly deployed bond token proxy.
    /// @param bondSustainabilityPerformanceTargetRateData SPT bond deployment
    ///        payload.
    event BondSustainabilityPerformanceTargetRateDeployed(
        address indexed deployer,
        address bondAddress,
        BondSustainabilityPerformanceTargetRateData bondSustainabilityPerformanceTargetRateData
    );

    /// @notice Emitted when a resolver proxy has been deployed.
    /// @param proxyAddress Address of the newly deployed proxy.
    /// @param resolver The BusinessLogicResolver backing the proxy.
    /// @param configKey Resolver configuration key assigned to the proxy.
    /// @param version Resolver configuration version.
    /// @param rbac Initial RBAC definitions applied to the proxy.
    event ProxyDeployed(
        address indexed proxyAddress,
        IBusinessLogicResolver resolver,
        bytes32 configKey,
        uint256 version,
        IResolverProxy.Rbac[] rbac
    );

    /// @notice Thrown when the provided resolver address is the zero address.
    /// @param resolver The resolver address that was supplied.
    error EmptyResolver(IBusinessLogicResolver resolver);
    /// @notice Thrown when the initial admin members list is empty.
    error NoInitialAdmins();
    /// @notice Thrown when the diamond proxy deployment reverted.
    /// @param proxy Address of the proxy that failed to deploy.
    error TokenDeploymentFailed(address proxy);
    /// @notice Thrown when the caller is not included in the initial
    ///         DEFAULT_ADMIN_ROLE members.
    /// @param sender Address of the caller that is not listed as admin.
    error SenderNotAdmin(address sender);
    /// @notice Thrown when the factory contract cannot be assigned admin
    ///         role.
    error FactoryCannotBeAdmin();
    /// @notice Thrown when two entries in an RBAC list share the same role.
    /// @param role The role identifier that appears more than once.
    error DuplicatedRole(bytes32 role);
    /// @notice Thrown when two entries in an RBAC list share the same member
    ///         address.
    /// @param role The role to which the duplicate member was assigned.
    /// @param member The member address that appears more than once.
    error DuplicatedMember(bytes32 role, address member);
    /// @notice Thrown when the member list for a given role is empty.
    /// @param role The role whose member list is empty.
    error EmptyMembers(bytes32 role);

    /**
     * @notice Deploys a new resolver proxy and initialises its RBAC.
     * @param _resolver BusinessLogicResolver instance backing the proxy.
     * @param _configKey Resolver configuration key to assign.
     * @param _version Resolver configuration version.
     * @param _rbacs Initial RBAC definitions.
     * @return proxyAddress_ Address of the deployed proxy.
     */
    function deployProxy(
        IBusinessLogicResolver _resolver,
        bytes32 _configKey,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbacs
    ) external returns (address proxyAddress_);

    /**
     * @notice Deploys a new equity token.
     * @param _equityData Equity deployment payload.
     * @param _factoryRegulationData Regulation metadata.
     * @return equityAddress_ Address of the deployed equity token proxy.
     */
    function deployEquity(
        EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address equityAddress_);

    /**
     * @notice Deploys a new variable-rate bond token.
     * @param _bondData Bond deployment payload.
     * @param _factoryRegulationData Regulation metadata.
     * @return bondAddress_ Address of the deployed bond token proxy.
     */
    function deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address bondAddress_);

    /**
     * @notice Deploys a new fixed-rate bond token.
     * @param _bondFixedRateData Fixed-rate bond deployment payload.
     * @return bondAddress_ Address of the deployed bond token proxy.
     */
    function deployBondFixedRate(BondFixedRateData calldata _bondFixedRateData) external returns (address bondAddress_);

    /**
     * @notice Deploys a new KPI-linked rate bond token.
     * @param _bondKpiLinkedRateData KPI-linked rate bond deployment payload.
     * @return bondAddress_ Address of the deployed bond token proxy.
     */
    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) external returns (address bondAddress_);

    /**
     * @notice Deploys a new sustainability performance target rate bond
     *         token.
     * @param _bondSustainabilityPerformanceTargetRateData SPT bond deployment
     *        payload.
     * @return bondAddress_ Address of the deployed bond token proxy.
     */
    function deployBondSustainabilityPerformanceTargetRate(
        BondSustainabilityPerformanceTargetRateData calldata _bondSustainabilityPerformanceTargetRateData
    ) external returns (address bondAddress_);

    /**
     * @notice Returns the regulation data for a given regulation type and
     *         sub-type.
     * @param _regulationType Primary regulation category.
     * @param _regulationSubType Jurisdiction or instrument-specific
     *        sub-category.
     * @return regulationData_ Matching regulation data.
     */
    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory regulationData_);
}
