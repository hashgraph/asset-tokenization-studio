// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "./IStaticFunctionSelectors.sol";
import { IBusinessLogicResolver } from "../diamond/IBusinessLogicResolver.sol";

/// @title IDiamondCut
/// @author Asset Tokenization Studio Team
/// @notice Interface for upgrading the Diamond proxy's Business Logic Resolver (BLR),
///         configuration identifier, and version in a single or multi-step operation.
interface IDiamondCut is IStaticFunctionSelectors {
    /// @notice Emitted when the resolver-proxy's Business Logic Resolver is replaced.
    /// @param caller Account that performed the update.
    /// @param oldResolver Previous Business Logic Resolver address.
    /// @param newResolver New Business Logic Resolver address.
    /// @param newConfigurationId Configuration identifier activated on the new resolver.
    /// @param newConfigurationVersion Configuration version activated on the new resolver.
    event ResolverUpdated(
        address indexed caller,
        address oldResolver,
        address newResolver,
        bytes32 newConfigurationId,
        uint256 newConfigurationVersion
    );

    /// @notice Emitted when the active configuration identifier is replaced.
    /// @param caller Account that performed the update.
    /// @param oldConfigurationId Previous configuration identifier.
    /// @param newConfigurationId New configuration identifier.
    /// @param newConfigurationVersion Version activated for the new configuration.
    event ConfigUpdated(
        address indexed caller,
        bytes32 oldConfigurationId,
        bytes32 newConfigurationId,
        uint256 newConfigurationVersion
    );

    /// @notice Emitted when the pinned version of the active configuration is replaced.
    /// @param caller Account that performed the update.
    /// @param oldConfigurationVersion Previous configuration version.
    /// @param newConfigurationVersion New configuration version.
    event ConfigVersionUpdated(
        address indexed caller,
        uint256 oldConfigurationVersion,
        uint256 newConfigurationVersion
    );

    /// @notice Thrown when a candidate resolver is the zero address or fails the
    ///         `isBusinessLogicResolver()` identity check.
    /// @param invalidResolver The address that failed validation.
    error InvalidBusinessLogicResolver(address invalidResolver);

    /**
     * @notice For the current BLR and configuration, update the used version.
     * @param _newVersion The new version number to set for the current configuration.
     */
    function updateConfigVersion(uint256 _newVersion) external;

    /**
     * @notice For the current BLR, update its configuration identifier and version.
     * @param _newConfigurationId The new configuration identifier to apply.
     * @param _newVersion The version number associated with the new configuration.
     */
    function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external;

    /**
     * @notice For the current BLR update its configuration
     * @param _newReplacementEnabled The replacement enabled flag to set
     **/
    function updateReplacementEnabled(bool _newReplacementEnabled) external;

    /**
     * @notice Replaces the Business Logic Resolver with a new one, setting configuration and version.
     * @param _newResolver The new BLR contract address to wire into the proxy.
     * @param _newConfigurationId The configuration identifier to activate on the new resolver.
     * @param _newVersion The version number associated with the new configuration.
     * @param _newReplacementEnabled The replacement enabled flag to set.
     */
    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion,
        bool _newReplacementEnabled
    ) external;

    /**
     * @notice Returns the active resolver address, configuration identifier, and version.
     * @return resolver_ Address of the current Business Logic Resolver.
     * @return proxyVersion_ proxy version.
     * @return configurationId_ Identifier of the active configuration.
     * @return configurationVersion_ Version number of the active configuration.
     * @return replacementEnabled_ Whether replacement is enabled.
     */
    function getConfigInfo()
        external
        view
        returns (
            address resolver_,
            bytes8 proxyVersion_,
            bytes32 configurationId_,
            uint256 configurationVersion_,
            bool replacementEnabled_
        );
}
