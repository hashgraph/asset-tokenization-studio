// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFactoryCommon } from "./IFactoryCommon.sol";
import { ResolverProxy } from "../infrastructure/proxy/ResolverProxy.sol";
import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { DEFAULT_ADMIN_ROLE } from "../constants/roles.sol";
import { RegulationType, RegulationSubType, _checkRegulationTypeAndSubType } from "../constants/regulation.sol";
import { IBusinessLogicResolver } from "../infrastructure/diamond/IBusinessLogicResolver.sol";
import { IAccessControl } from "../facets/accessControl/IAccessControl.sol";
import { IDiamondFacet } from "../infrastructure/diamond/IDiamondFacet.sol";
import { ICore } from "../facets/core/ICore.sol";
import { IControlList } from "../facets/controlList/IControlList.sol";
import {
    IExternalControlListManagement
} from "../facets/externalControlListManagement/IExternalControlListManagement.sol";
import { ICap } from "../facets/cap/ICap.sol";
import { ICapByPartition } from "../facets/capByPartition/ICapByPartition.sol";
import { ICustomData } from "../facets/customData/ICustomData.sol";
import { IDocumentation } from "../facets/documentation/IDocumentation.sol";
import { IPartitions } from "../facets/partitions/IPartitions.sol";
import { IController } from "../facets/controller/IController.sol";

/**
 * @title FactoryCommon
 * @notice Shared proxy-deployment foundation reused by every ATS factory facet.
 * @dev Holds the input validation modifiers plus the resolver-proxy creation and always-on
 *      base-facet initialisation that both `Factory` (equity/bond) and `DepositTokenFactory`
 *      rely on. Keeping this foundation in its own abstract — and each facet's deployment entry
 *      points in a dedicated interface (`IFactoryEquityBond`, `IDepositTokenFactory`) — lets each
 *      concrete facet compile only the deployment logic it serves, so the compiler's dead-code
 *      elimination keeps every deployed facet under the EIP-170 24 KB limit.
 * @author Asset Tokenization Studio Team
 */
abstract contract FactoryCommon is IFactoryCommon {
    /**
     * @notice Maximum number of security facets validated in one operational-status pass.
     * @dev Must remain greater than or equal to the largest deployed security configuration.
     *      Increasing the configured facet set beyond this value requires updating this
     *      constant or accepting multi-transaction operational-status completion.
     */
    uint256 internal constant _SECURITY_FACETS_MAX = 150;

    /**
     * @notice Guarantees a non-zero business logic resolver is provided.
     * @dev Delegates to `_checkResolver`, which reverts with `EmptyResolver` when the resolver
     *      address is zero.
     * @param resolver Resolver that will supply facet configuration for the proxy.
     */
    modifier onlyValidResolver(IBusinessLogicResolver resolver) {
        _checkResolver(resolver);
        _;
    }

    /**
     * @notice Guarantees the initial RBAC configuration includes at least one admin.
     * @dev Delegates to `_checkAdmins`, which reverts with `NoInitialAdmins` unless a non-zero
     *      `DEFAULT_ADMIN_ROLE` member exists in the supplied RBAC entries.
     * @param rbacs Initial role assignments passed to the deployed proxy.
     */
    modifier onlyValidAdmins(IResolverProxy.Rbac[] calldata rbacs) {
        _checkAdmins(rbacs);
        _;
    }

    /**
     * @notice Guarantees the regulation type and sub-type combination is supported.
     * @dev Delegates to `_checkRegulationTypeAndSubType`, which reverts for invalid combinations.
     * @param _regulationType Primary regulation category.
     * @param _regulationSubType Secondary regulation category.
     */
    modifier onlyValidRegulation(RegulationType _regulationType, RegulationSubType _regulationSubType) {
        _checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
        _;
    }

    /**
     * @notice Deploys a bare security proxy and seeds this factory as a temporary admin.
     * @dev Builds an extended RBAC array that appends `address(this)` as a `DEFAULT_ADMIN_ROLE`
     *      member so the factory can run facet initialisers. Callers MUST renounce that role
     *      once initialisation completes (see `IAccessControl.renounceRole`). The proxy is
     *      returned uninitialised; facet initialisers are the caller's responsibility.
     * @param _securityData Common security deployment configuration.
     * @return securityAddress_ Address of the freshly deployed, uninitialised security proxy.
     */
    function _deploySecurityProxy(SecurityData calldata _securityData) internal returns (address securityAddress_) {
        uint256 rbacsLen = _securityData.rbacs.length;
        IResolverProxy.Rbac[] memory extendedRbacs = new IResolverProxy.Rbac[](rbacsLen + 1);
        for (uint256 i; i < rbacsLen; ) {
            extendedRbacs[i] = _securityData.rbacs[i];
            unchecked {
                ++i;
            }
        }
        extendedRbacs[rbacsLen] = IResolverProxy.Rbac({ role: DEFAULT_ADMIN_ROLE, members: new address[](1) });
        extendedRbacs[rbacsLen].members[0] = address(this);
        ResolverProxy proxy = new ResolverProxy(
            _securityData.resolver,
            _securityData.resolverProxyConfiguration.key,
            _securityData.resolverProxyConfiguration.version,
            extendedRbacs
        );
        securityAddress_ = address(proxy);
    }

    /**
     * @notice Initialises a security's metadata, eligibility, supply caps and partition
     *         configuration.
     * @dev Covers the always-on infrastructure (access control, diamond cut) plus core metadata,
     *      control lists, caps, custom data, documentation and the partition and controller flags.
     *      Nominal value is asset-specific and initialised separately by each deployer.
     * @param _securityAddress Address of the security proxy being initialised.
     * @param _securityData Common security deployment configuration.
     * @param _securityType Security type recorded in core metadata.
     */
    function _initializeBaseConfiguration(
        address _securityAddress,
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal {
        IAccessControl(_securityAddress).initializeAccessControl();
        IDiamondFacet(_securityAddress).initializeDiamondCut();

        ICore.ERC20Metadata memory erc20Metadata = ICore.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });
        ICore(_securityAddress).initializeCore(erc20Metadata);
        IControlList(_securityAddress).initializeControlList(_securityData.isWhiteList);
        IExternalControlListManagement(_securityAddress).initializeExternalControlLists(
            _securityData.externalControlLists
        );
        ICap(_securityAddress).initializeCap(_securityData.maxSupply, new ICap.PartitionCap[](0));
        ICapByPartition(_securityAddress).initializeCapByPartition();
        ICustomData(_securityAddress).initializeCustomData(new ICustomData.CustomDataEntry[](0));
        IDocumentation(_securityAddress).initializeDocumentation();

        IPartitions(_securityAddress).initializePartitions(_securityData.isMultiPartition);
        IController(_securityAddress).initializeController(_securityData.isControllable);
    }

    /**
     * @notice Asserts that a non-zero business logic resolver is provided.
     * @dev Reverts with `EmptyResolver` when the resolver address is zero.
     * @param resolver Resolver that will supply facet configuration for the proxy.
     */
    function _checkResolver(IBusinessLogicResolver resolver) private pure {
        if (address(resolver) == address(0)) {
            revert EmptyResolver(resolver);
        }
    }

    /**
     * @notice Ensures the initial RBAC list contains at least one non-zero admin member.
     * @dev Performs a linear scan over supplied RBAC entries and members. Reverts with
     *      `NoInitialAdmins` when no valid `DEFAULT_ADMIN_ROLE` member is found.
     * @param rbacs Initial role assignments to inspect.
     */
    function _checkAdmins(IResolverProxy.Rbac[] calldata rbacs) private pure {
        uint256 rbacsLength = rbacs.length;
        for (uint256 rbacsIndex; rbacsIndex < rbacsLength; ) {
            if (rbacs[rbacsIndex].role == DEFAULT_ADMIN_ROLE) {
                uint256 membersLength = rbacs[rbacsIndex].members.length;
                for (uint256 adminMemberIndex; adminMemberIndex < membersLength; ) {
                    if (rbacs[rbacsIndex].members[adminMemberIndex] != address(0)) {
                        return;
                    }
                    unchecked {
                        ++adminMemberIndex;
                    }
                }
            }
            unchecked {
                ++rbacsIndex;
            }
        }
        revert NoInitialAdmins();
    }
}
