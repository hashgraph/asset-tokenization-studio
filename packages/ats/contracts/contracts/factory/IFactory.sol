// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { IBusinessLogicResolver } from "../infrastructure/diamond/IBusinessLogicResolver.sol";
import { IFactoryCommon } from "./IFactoryCommon.sol";
import { FactoryRegulationData, RegulationData, RegulationType, RegulationSubType } from "../constants/regulation.sol";

/// @custom:hash resolverKey Factory
bytes32 constant RESOLVER_KEY_FACTORY = 0x9fc26269cc1cb994e66f269ed6b58a5bb0c344a134b9dabd342ac466d48f95c7;

/// @custom:hash resolverKey DepositTokenFactory
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_DEPOSIT_TOKEN_FACTORY = 0x25810c480c4f47fa7820404f31c4f669ef477b138e4ca976461699a99716b8b2;

/**
 * @title IFactoryEquityBond
 * @author Asset Tokenization Studio Team
 * @notice Deployment entry points served by `FactoryFacet`: raw proxy, equity and bond deployment
 *         plus regulation-data resolution. Implemented by `Factory`.
 */
interface IFactoryEquityBond is IFactoryCommon {
    /**
     * @notice Deploys a new resolver proxy and initialises its RBAC.
     * @param _resolver Business-logic resolver to attach.
     * @param _configKey Configuration identifier for the proxy.
     * @param _version Initial configuration version.
     * @param _rbacs Role-based access control entries to seed.
     * @param _data Additional data for the proxy deployment.
     * @return proxyAddress_ Address of the deployed proxy.
     */
    function deployProxy(
        IBusinessLogicResolver _resolver,
        bytes32 _configKey,
        uint256 _version,
        IResolverProxy.Rbac[] memory _rbacs,
        bytes calldata _data
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

/**
 * @title IDepositTokenFactory
 * @author Asset Tokenization Studio Team
 * @notice Deposit-token deployment entry point served by `DepositTokenFactoryFacet`. Split out of
 *         the equity/bond factory so its large facet set does not push `FactoryFacet` past the
 *         EIP-170 24 KB bytecode limit. Implemented by `DepositTokenFactory`.
 */
interface IDepositTokenFactory is IFactoryCommon {
    /**
     * @notice Deploys a new deposit token from the supplied configuration.
     * @dev DepositToken is a minimal cash-style asset; the regulation data is validated and
     *      emitted for indexing but not persisted on-chain.
     * @param _depositTokenData Deposit token creation data wrapping the shared `SecurityData`.
     * @param _factoryRegulationData Regulation type and sub-type validated for the deposit token.
     * @return depositTokenAddress_ Address of the newly deployed deposit token proxy.
     */
    function deployDepositToken(
        DepositTokenData calldata _depositTokenData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address depositTokenAddress_);
}

/**
 * @title IFactory
 * @author Asset Tokenization Studio Team
 * @notice Union of every factory deployment entry point. No single facet implements it; it is the
 *         ABI surface off-chain callers use against the factory ResolverProxy, which dispatches each
 *         selector to the owning facet (`FactoryFacet` or `DepositTokenFactoryFacet`).
 */
interface IFactory is IFactoryEquityBond, IDepositTokenFactory {}
