pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IDiamond} from '../../interfaces/diamond/IDiamond.sol';
import {IDiamondCut} from '../../interfaces/diamond/IDiamondCut.sol';
import {
    IBusinessLogicResolver
} from '../../interfaces/resolver/IBusinessLogicResolver.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {IDiamondLoupe} from '../../interfaces/diamond/IDiamondLoupe.sol';
import {
    AccessControlStorageWrapper
} from '../../layer_1/accessControl/AccessControlStorageWrapper.sol';
import {PauseStorageWrapper} from '../../layer_1/pause/PauseStorageWrapper.sol';
import {
    _DIAMOND_STORAGE_POSITION
} from '../../layer_1/constants/storagePositions.sol';
import {
    _DIAMOND_CUT_RESOLVER_KEY,
    _DIAMOND_LOUPE_RESOLVER_KEY,
    _DIAMOND_RESOLVER_KEY
} from '../../layer_1/constants/resolverKeys.sol';

// Remember to add the loupe functions from DiamondLoupeFacet to the diamond.
// The loupe functions are required by the EIP2535 Diamonds standard
abstract contract DiamondUnstructured is
    AccessControlStorageWrapper,
    PauseStorageWrapper
{
    struct FacetKeysAndSelectorPosition {
        bytes32 facetKey;
        uint16 selectorPosition;
    }

    struct DiamondStorage {
        IBusinessLogicResolver resolver;
        // function selector => facet address and selector position in selectors array
        mapping(bytes4 => FacetKeysAndSelectorPosition) facetKeysAndSelectorPosition;
        bytes32[] facetKeys;
        bytes4[] selectors;
        bytes4[] interfaceIds;
        mapping(bytes4 => bool) supportedInterfaces;
        // AccessControl instead of owned. Only DEFAULT_ADMIN role.
    }

    modifier onlyWithDiamondFacets(bytes32[] memory _facets) {
        if (_isNotDiamondFacetsIn(_facets)) {
            revert IDiamond.DiamondFacetsNotFound();
        }
        _;
    }

    function _getDiamondStorage()
        internal
        pure
        returns (DiamondStorage storage ds)
    {
        bytes32 position = _DIAMOND_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    function _initialize(
        IBusinessLogicResolver _resolver,
        bytes32[] memory _businessLogicKeys,
        IDiamond.Rbac[] memory _rbacs
    ) internal {
        DiamondStorage storage ds = _getDiamondStorage();
        ds.resolver = _resolver;
        _cleanAndRegisterBusinessLogics(ds, _businessLogicKeys);
        _assignRbacRoles(_rbacs);
    }

    function _assignRbacRoles(IDiamond.Rbac[] memory _rbacs) internal {
        for (uint256 rbacIndex; rbacIndex < _rbacs.length; rbacIndex++) {
            for (
                uint256 memberIndex;
                memberIndex < _rbacs[rbacIndex].members.length;
                memberIndex++
            ) {
                _grantRole(
                    _rbacs[rbacIndex].role,
                    _rbacs[rbacIndex].members[memberIndex]
                );
            }
        }
    }

    function _cleanAndRegisterBusinessLogics(
        DiamondStorage storage _diamondStorage,
        bytes32[] memory _businessLogicKeys
    ) internal onlyWithDiamondFacets(_businessLogicKeys) {
        _cleanBusinessLogics(_diamondStorage);
        (
            bytes4[][] memory selectors,
            bytes4[][] memory interfaceIds
        ) = _getSelectorsAndInterfaceIdsByBusinessLogicKeys(
                _diamondStorage.resolver,
                _businessLogicKeys
            );
        _registerBusinessLogics(
            _diamondStorage,
            _businessLogicKeys,
            selectors,
            interfaceIds
        );
    }

    function _cleanBusinessLogics(
        DiamondStorage storage _diamondStorage
    ) internal {
        bytes4 selector;
        for (; _diamondStorage.interfaceIds.length != 0; ) {
            _diamondStorage.interfaceIds.pop();
        }
        for (; _diamondStorage.selectors.length != 0; ) {
            selector = _diamondStorage.selectors[
                _diamondStorage.selectors.length - 1
            ];
            delete _diamondStorage.facetKeysAndSelectorPosition[selector];
            delete _diamondStorage.supportedInterfaces[selector];
            _diamondStorage.selectors.pop();
        }
        for (; _diamondStorage.facetKeys.length != 0; ) {
            _diamondStorage.facetKeys.pop();
        }
    }

    function _registerBusinessLogics(
        DiamondStorage storage _diamondStorage,
        bytes32[] memory _facetKeys,
        bytes4[][] memory _functionSelectors,
        bytes4[][] memory _interfaceIds
    ) internal {
        bytes32 facetKey;
        bytes4 selector;
        uint16 selectorPosition = uint16(_diamondStorage.selectors.length);
        for (
            uint256 businessLogicKeyIndex;
            businessLogicKeyIndex < _facetKeys.length;
            businessLogicKeyIndex++
        ) {
            facetKey = _facetKeys[businessLogicKeyIndex];
            _diamondStorage.facetKeys.push(facetKey);
            for (
                uint256 selectorIndex;
                selectorIndex <
                _functionSelectors[businessLogicKeyIndex].length;
                selectorIndex++
            ) {
                selector = _functionSelectors[businessLogicKeyIndex][
                    selectorIndex
                ];
                _diamondStorage.facetKeysAndSelectorPosition[
                    selector
                ] = FacetKeysAndSelectorPosition({
                    facetKey: facetKey,
                    selectorPosition: selectorPosition++
                });
                _diamondStorage.selectors.push(selector);
                _diamondStorage.supportedInterfaces[selector] = true;
            }
            for (
                uint256 interfaceIndex;
                interfaceIndex < _interfaceIds[businessLogicKeyIndex].length;
                interfaceIndex++
            ) {
                _diamondStorage.supportedInterfaces[
                    _interfaceIds[businessLogicKeyIndex][interfaceIndex]
                ] = true;
                _diamondStorage.interfaceIds.push(
                    _interfaceIds[businessLogicKeyIndex][interfaceIndex]
                );
            }
        }
    }

    function _getSelectorsAndInterfaceIdsByBusinessLogicKeys(
        IBusinessLogicResolver _resolver,
        bytes32[] memory _businessLogicKeys
    )
        internal
        view
        returns (bytes4[][] memory selectors_, bytes4[][] memory interfaceIds_)
    {
        bytes32 businessLogicKey;
        selectors_ = new bytes4[][](_businessLogicKeys.length);
        interfaceIds_ = new bytes4[][](_businessLogicKeys.length);
        for (
            uint256 businessLogicKeyIndex;
            businessLogicKeyIndex < _businessLogicKeys.length;
            businessLogicKeyIndex++
        ) {
            businessLogicKey = _businessLogicKeys[businessLogicKeyIndex];
            (
                selectors_[businessLogicKeyIndex],
                interfaceIds_[businessLogicKeyIndex]
            ) = _getSelectorsAndInterfaceIdsByBusinessLogicKey(
                _resolver,
                businessLogicKey
            );
        }
    }

    function _getSelectorsAndInterfaceIdsByBusinessLogicKey(
        IBusinessLogicResolver _resolver,
        bytes32 _businessLogicKey
    )
        internal
        view
        returns (bytes4[] memory selectors_, bytes4[] memory interfaceIds_)
    {
        address businessLogicAddress = _resolver.resolveLatestBusinessLogic(
            _businessLogicKey
        );
        if (businessLogicAddress == address(0)) {
            revert IDiamondCut.DiamondFacetNotFoundInRegistry(
                _businessLogicKey
            );
        }
        IStaticFunctionSelectors staticFunctionSelectors = IStaticFunctionSelectors(
                businessLogicAddress
            );
        if (
            _businessLogicKey != staticFunctionSelectors.getStaticResolverKey()
        ) {
            revert IDiamondCut.InvalidBusinessLogicKey(
                _businessLogicKey,
                staticFunctionSelectors.getStaticResolverKey(),
                businessLogicAddress
            );
        }
        selectors_ = staticFunctionSelectors.getStaticFunctionSelectors();
        interfaceIds_ = staticFunctionSelectors.getStaticInterfaceIds();
    }

    function _getFacets(
        DiamondStorage storage _diamondStorage
    ) internal view returns (IDiamondLoupe.Facet[] memory facets_) {
        facets_ = new IDiamondLoupe.Facet[](_diamondStorage.facetKeys.length);
        for (
            uint256 facetIndex;
            facetIndex < _diamondStorage.facetKeys.length;
            facetIndex++
        ) {
            facets_[facetIndex] = _getFacet(
                _diamondStorage,
                _diamondStorage.facetKeys[facetIndex]
            );
        }
    }

    function _getFacet(
        DiamondStorage storage _diamondStorage,
        bytes32 _facetKey
    ) internal view returns (IDiamondLoupe.Facet memory facet_) {
        (
            bytes4[] memory functionSelectors,
            bytes4[] memory interfaceIds
        ) = _getSelectorsAndInterfaceIdsByBusinessLogicKey(
                _diamondStorage.resolver,
                _facetKey
            );
        facet_ = IDiamondLoupe.Facet({
            facetKey: _facetKey,
            facetAddress: _diamondStorage.resolver.resolveLatestBusinessLogic(
                _facetKey
            ),
            functionSelectors: functionSelectors,
            interfaceIds: interfaceIds
        });
    }

    function _getFacetAddresses(
        DiamondStorage storage _diamondStorage
    ) internal view returns (address[] memory facetAddresses_) {
        facetAddresses_ = new address[](_diamondStorage.facetKeys.length);
        bytes32 facetKey;
        for (
            uint256 facetIndex;
            facetIndex < _diamondStorage.facetKeys.length;
            facetIndex++
        ) {
            facetKey = _diamondStorage.facetKeys[facetIndex];
            facetAddresses_[facetIndex] = _diamondStorage
                .resolver
                .resolveLatestBusinessLogic(facetKey);
        }
    }

    function _getFacetAddress(
        DiamondStorage storage _diamondStorage,
        bytes4 _signature
    ) internal view returns (address) {
        return
            _diamondStorage.resolver.resolveLatestBusinessLogic(
                _diamondStorage
                    .facetKeysAndSelectorPosition[_signature]
                    .facetKey
            );
    }

    function _isNotDiamondFacetsIn(
        bytes32[] memory _facets
    ) internal returns (bool) {
        bool diamondCutFacetFound;
        bool diamondLoupeFacetFound;
        bool diamondFacetFound;
        for (
            uint256 facetsIndex;
            facetsIndex < _facets.length &&
                (diamondCutFacetFound && diamondLoupeFacetFound) ==
                diamondFacetFound;
            facetsIndex++
        ) {
            diamondCutFacetFound =
                diamondCutFacetFound ||
                (_facets[facetsIndex] == _DIAMOND_CUT_RESOLVER_KEY);
            diamondLoupeFacetFound =
                diamondLoupeFacetFound ||
                (_facets[facetsIndex] == _DIAMOND_LOUPE_RESOLVER_KEY);
            diamondFacetFound =
                diamondFacetFound ||
                _facets[facetsIndex] == _DIAMOND_RESOLVER_KEY;
        }
        return
            (diamondCutFacetFound && diamondLoupeFacetFound) ==
            diamondFacetFound;
    }
}
