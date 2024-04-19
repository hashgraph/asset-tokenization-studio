pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IFactory} from '../interfaces/factory/IFactory.sol';
import {Diamond} from '../diamond/Diamond.sol';
import {IDiamond} from '../interfaces/diamond/IDiamond.sol';
import {_DEFAULT_ADMIN_ROLE} from '../layer_1/constants/roles.sol';
import {IControlList} from '../layer_1/interfaces/controlList/IControlList.sol';
import {IERC20} from '../layer_1/interfaces/ERC1400/IERC20.sol';
import {IERC1644} from '../layer_1/interfaces/ERC1400/IERC1644.sol';
import {IERC1410Basic} from '../layer_1/interfaces/ERC1400/IERC1410Basic.sol';
import {ICap} from '../layer_1/interfaces/cap/ICap.sol';
import {IERC1594} from '../layer_1/interfaces/ERC1400/IERC1594.sol';
import {
    IBusinessLogicResolver
} from '../interfaces/resolver/IBusinessLogicResolver.sol';
import {LocalContext} from '../layer_1/context/LocalContext.sol';
import {_ISIN_LENGTH} from '../layer_1/constants/values.sol';
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

contract Factory is IFactory, LocalContext {
    modifier checkResolver(IBusinessLogicResolver resolver) {
        if (address(resolver) == address(0)) {
            revert EmptyResolver(resolver);
        }
        _;
    }

    modifier checkISIN(string calldata isin) {
        if (bytes(isin).length != _ISIN_LENGTH) {
            revert WrongISIN(isin);
        }
        _;
    }

    modifier checkAdmins(IDiamond.Rbac[] calldata rbacs) {
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

    // Deploys a new equity given the input equity data
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

    // Deploys a new equity given the input equity data
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
            _bondData.couponDetails,
            buildRegulationData(
                _factoryRegulationData.regulationType,
                _factoryRegulationData.regulationSubType
            ),
            _factoryRegulationData.additionalSecurityData
        );

        emit BondDeployed(
            _msgSender(),
            bondAddress_,
            _bondData,
            _factoryRegulationData
        );
    }

    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) private returns (address securityAddress_) {
        Diamond equity = new Diamond(
            _securityData.resolver,
            _securityData.businessLogicKeys,
            _securityData.rbacs
        );

        securityAddress_ = address(equity);

        // configure Control List
        IControlList(securityAddress_).initialize_ControlList(
            _securityData.isWhiteList
        );

        // configure multi partition flag
        IERC1410Basic(securityAddress_).initialize_ERC1410_Basic(
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
}
