// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

bytes32 constant _MOCK_FACET_1_RESOLVER_KEY = bytes32("MockFacet1");
bytes32 constant _MOCK_FACET_2_RESOLVER_KEY = bytes32("MockFacet2");
bytes32 constant _MOCK_FACET_3_RESOLVER_KEY = bytes32("MockFacet3");

function _versions() pure returns (uint256[] memory arr) {
    arr = new uint256[](2);
    arr[0] = 1;
    arr[1] = 2;
}
interface IMockFacet1 {
    function initializeMockFacet1() external;
    function upgradeMockFacet1() external;
    function mockFacet1Method() external view returns (string memory);
}

interface IMockFacet2 {
    function initializeMockFacet2() external;
    function upgradeMockFacet2() external;
    function mockFacet2Method() external view returns (string memory);
}

interface IMockFacet3 {
    function initializeMockFacet3(uint256 statusStep) external;
    function upgradeMockFacet3(uint256 statusStep) external;
    function mockFacet3Method() external view returns (string memory);
}

contract MockFacet1 is IMockFacet1, Modifiers, IStaticFunctionSelectors {
    function initializeMockFacet1() external override onlyFacetNotRegistered(_MOCK_FACET_1_RESOLVER_KEY) {
        InitializerStorageWrapper.setFacetToReady(_MOCK_FACET_1_RESOLVER_KEY);
    }

    function upgradeMockFacet1() external override onlyFacetRegistered(_MOCK_FACET_1_RESOLVER_KEY, _versions()) {
        InitializerStorageWrapper.setFacetToReady(_MOCK_FACET_1_RESOLVER_KEY);
    }

    function mockFacet1Method() external view override onlyOperational returns (string memory) {
        return "MockFacet1 method called";
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _MOCK_FACET_1_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        return
            Bytes4Builder.build(
                this.initializeMockFacet1.selector,
                this.upgradeMockFacet1.selector,
                this.mockFacet1Method.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IMockFacet1).interfaceId);
    }
}

contract MockFacet2 is IMockFacet2, Modifiers, IStaticFunctionSelectors {
    function initializeMockFacet2() external override onlyFacetNotRegistered(_MOCK_FACET_2_RESOLVER_KEY) {
        InitializerStorageWrapper.setFacetToReady(_MOCK_FACET_2_RESOLVER_KEY);
    }

    function upgradeMockFacet2() external override onlyFacetRegistered(_MOCK_FACET_2_RESOLVER_KEY, _versions()) {
        InitializerStorageWrapper.setFacetToReady(_MOCK_FACET_2_RESOLVER_KEY);
    }

    function mockFacet2Method() external view override onlyOperational returns (string memory) {
        return "MockFacet2 method called";
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _MOCK_FACET_2_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        return
            Bytes4Builder.build(
                this.initializeMockFacet2.selector,
                this.upgradeMockFacet2.selector,
                this.mockFacet2Method.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IMockFacet2).interfaceId);
    }
}

contract MockFacet3 is IMockFacet3, Modifiers, IStaticFunctionSelectors {
    function initializeMockFacet3(
        uint256 statusStep
    ) external override onlyFacetNotRegistered(_MOCK_FACET_3_RESOLVER_KEY) {
        if (statusStep == 0) {
            InitializerStorageWrapper.setFacetToReady(_MOCK_FACET_3_RESOLVER_KEY);
        } else InitializerStorageWrapper.setFacetToCustomStatus(_MOCK_FACET_3_RESOLVER_KEY, statusStep + 1);
    }

    function upgradeMockFacet3(
        uint256 statusStep
    ) external override onlyFacetRegistered(_MOCK_FACET_3_RESOLVER_KEY, _versions()) {
        if (statusStep == 0) {
            InitializerStorageWrapper.setFacetToReady(_MOCK_FACET_3_RESOLVER_KEY);
        } else InitializerStorageWrapper.setFacetToCustomStatus(_MOCK_FACET_3_RESOLVER_KEY, statusStep + 1);
    }

    function mockFacet3Method() external view override onlyOperational returns (string memory) {
        return "MockFacet3 method called";
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _MOCK_FACET_3_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        return
            Bytes4Builder.build(
                this.initializeMockFacet3.selector,
                this.upgradeMockFacet3.selector,
                this.mockFacet3Method.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IMockFacet3).interfaceId);
    }
}
