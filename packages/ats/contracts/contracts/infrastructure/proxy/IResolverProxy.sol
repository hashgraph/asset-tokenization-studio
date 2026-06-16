// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IResolverProxy {
    struct ResolverProxyConfigurationGeneric {
        bytes8 resolverProxyVersion;
        bytes content;
    }

    struct ResolverProxyConfigurationV2 {
        bytes32 configurationId;
        uint256 configurationVersion;
        bool replacementEnabled;
    }

    struct Rbac {
        bytes32 role;
        address[] members;
    }

    /// @notice Thrown when no function exists for function called
    error FunctionNotFound(bytes4 _functionSelector);

    /// @notice Thrown when the stored configuration carries an unrecognized version tag
    error UnrecognizedResolverProxyConfigurationVersion(uint256 _resolverProxyConfigurationVersion);
}
