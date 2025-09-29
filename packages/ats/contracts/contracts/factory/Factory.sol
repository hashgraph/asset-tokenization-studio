// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {IFactory} from '../interfaces/factory/IFactory.sol';
import {ResolverProxy} from '../resolver/resolverProxy/ResolverProxy.sol';
import {
    IResolverProxy
} from '../interfaces/resolver/resolverProxy/IResolverProxy.sol';
import {_DEFAULT_ADMIN_ROLE} from '../layer_1/constants/roles.sol';
import {IControlList} from '../layer_1/interfaces/controlList/IControlList.sol';
import {IERC20} from '../layer_1/interfaces/ERC1400/IERC20.sol';
import {IERC20Permit} from '../layer_1/interfaces/ERC1400/IERC20Permit.sol';
import {IERC20Votes} from '../layer_1/interfaces/ERC1400/IERC20Votes.sol';
import {IERC1644} from '../layer_1/interfaces/ERC1400/IERC1644.sol';
import {IERC1410} from '../layer_1/interfaces/ERC1400/IERC1410.sol';
import {ICap} from '../layer_1/interfaces/cap/ICap.sol';
import {IERC1594} from '../layer_1/interfaces/ERC1400/IERC1594.sol';
import {
    IClearingActions
} from '../layer_1/interfaces/clearing/IClearingActions.sol';
import {
    IBusinessLogicResolver
} from '../interfaces/resolver/IBusinessLogicResolver.sol';
import {LocalContext} from '../layer_0/context/LocalContext.sol';
import {
    FactoryRegulationData,
    buildRegulationData,
    RegulationData,
    RegulationType,
    RegulationSubType,
    checkRegulationTypeAndSubType
} from '../layer_3/constants/regulation.sol';
import {IEquityUSA} from '../layer_3/interfaces/IEquityUSA.sol';
import {IBondUSA} from '../layer_3/interfaces/IBondUSA.sol';
import {
    IProceedRecipients
} from '../layer_2/interfaces/proceedRecipients/IProceedRecipients.sol';
import {
    IProtectedPartitions
} from '../layer_1/interfaces/protectedPartitions/IProtectedPartitions.sol';
import {
    IExternalPauseManagement
} from '../layer_1/interfaces/externalPauses/IExternalPauseManagement.sol';
import {
    IExternalControlListManagement
} from '../layer_1/interfaces/externalControlLists/IExternalControlListManagement.sol';
import {
    IExternalKycListManagement
} from '../layer_1/interfaces/externalKycLists/IExternalKycListManagement.sol';
import {IKyc} from '../layer_1/interfaces/kyc/IKyc.sol';
import {IERC3643} from '../layer_1/interfaces/ERC3643/IERC3643.sol';
import {validateISIN} from './isinValidator.sol';

contract Factory is IFactory, LocalContext {
    modifier checkResolver(IBusinessLogicResolver resolver) {
        if (address(resolver) == address(0)) {
            revert EmptyResolver(resolver);
        }
        _;
    }

    modifier checkISIN(string calldata isin) {
        validateISIN(isin);
        _;
    }

    modifier checkAdmins(IResolverProxy.Rbac[] calldata rbacs) {
        bool adminFound;

        // Looking for admin role within initialization rbacas in order to add the factory
        for (uint256 rbacsIndex = 0; rbacsIndex < rbacs.length; rbacsIndex++) {
            if (rbacs[rbacsIndex].role == _DEFAULT_ADMIN_ROLE) {
                if (rbacs[rbacsIndex].members.length > 0) {
                    for (
                        uint256 adminMemberIndex = 0;
                        adminMemberIndex < rbacs[rbacsIndex].members.length;
                        adminMemberIndex++
                    ) {
                        if (
                            rbacs[rbacsIndex].members[adminMemberIndex] !=
                            address(0)
                        ) {
                            adminFound = true;
                            break;
                        }
                    }
                    if (adminFound) {
                        break;
                    }
                }
            }
        }

        if (!adminFound) {
            revert NoInitialAdmins();
        }
        _;
    }

    modifier checkRegulation(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) {
        checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
        _;
    }

    function deployEquity(
        EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    )
        external
        checkResolver(_equityData.security.resolver)
        checkISIN(_equityData.security.erc20MetadataInfo.isin)
        checkAdmins(_equityData.security.rbacs)
        checkRegulation(
            _factoryRegulationData.regulationType,
            _factoryRegulationData.regulationSubType
        )
        returns (address equityAddress_)
    {
        equityAddress_ = _deploySecurity(
            _equityData.security,
            SecurityType.Equity
        );

        IEquityUSA(equityAddress_)._initialize_equityUSA(
            _equityData.equityDetails,
            buildRegulationData(
                _factoryRegulationData.regulationType,
                _factoryRegulationData.regulationSubType
            ),
            _factoryRegulationData.additionalSecurityData
        );

        emit EquityDeployed(
            _msgSender(),
            equityAddress_,
            _equityData,
            _factoryRegulationData
        );
    }

    function deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData
    )
        external
        checkResolver(_bondData.security.resolver)
        checkISIN(_bondData.security.erc20MetadataInfo.isin)
        checkAdmins(_bondData.security.rbacs)
        checkRegulation(
            _factoryRegulationData.regulationType,
            _factoryRegulationData.regulationSubType
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deploySecurity(_bondData.security, SecurityType.Bond);

        IBondUSA(bondAddress_)._initialize_bondUSA(
            _bondData.bondDetails,
            buildRegulationData(
                _factoryRegulationData.regulationType,
                _factoryRegulationData.regulationSubType
            ),
            _factoryRegulationData.additionalSecurityData
        );

        IProceedRecipients(bondAddress_).initialize_ProceedRecipients(
            _bondData.proceedRecipients,
            _bondData.proceedRecipientsData
        );

        emit BondDeployed(
            _msgSender(),
            bondAddress_,
            _bondData,
            _factoryRegulationData
        );
    }

    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure override returns (RegulationData memory regulationData_) {
        regulationData_ = buildRegulationData(
            _regulationType,
            _regulationSubType
        );
    }

    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) private returns (address securityAddress_) {
        ResolverProxy equity = new ResolverProxy(
            _securityData.resolver,
            _securityData.resolverProxyConfiguration.key,
            _securityData.resolverProxyConfiguration.version,
            _securityData.rbacs
        );

        securityAddress_ = address(equity);

        // configure Control List
        IControlList(securityAddress_).initialize_ControlList(
            _securityData.isWhiteList
        );

        // configure multi partition flag
        IERC1410(securityAddress_).initialize_ERC1410(
            _securityData.isMultiPartition
        );

        // configure controller flag
        IERC1644(securityAddress_).initialize_ERC1644(
            _securityData.isControllable
        );

        // configure erc20 metadata
        IERC20.ERC20Metadata memory erc20Metadata = IERC20.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });

        IERC20(securityAddress_).initialize_ERC20(erc20Metadata);

        // configure issue flag
        IERC1594(securityAddress_).initialize_ERC1594();

        // configure issue flag
        ICap(securityAddress_).initialize_Cap(
            _securityData.maxSupply,
            new ICap.PartitionCap[](0)
        );

        IProtectedPartitions(securityAddress_).initialize_ProtectedPartitions(
            _securityData.arePartitionsProtected
        );

        IClearingActions(securityAddress_).initializeClearing(
            _securityData.clearingActive
        );

        IExternalPauseManagement(securityAddress_).initialize_ExternalPauses(
            _securityData.externalPauses
        );

        IExternalControlListManagement(securityAddress_)
            .initialize_ExternalControlLists(
                _securityData.externalControlLists
            );

        IKyc(securityAddress_).initializeInternalKyc(
            _securityData.internalKycActivated
        );

        IExternalKycListManagement(securityAddress_)
            .initialize_ExternalKycLists(_securityData.externalKycLists);

        IERC20Votes(securityAddress_).initialize_ERC20Votes(
            _securityData.erc20VotesActivated
        );

        IERC20Permit(securityAddress_).initialize_ERC20Permit();
        IERC3643(securityAddress_).initialize_ERC3643(
            _securityData.compliance,
            _securityData.identityRegistry
        );
    }
}
