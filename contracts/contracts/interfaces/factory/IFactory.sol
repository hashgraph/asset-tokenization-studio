pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IDiamond} from '../../interfaces/diamond/IDiamond.sol';
import {IBusinessLogicResolver} from '../resolver/IBusinessLogicResolver.sol';
import {ERC20} from '../../layer_1/ERC1400/ERC20/ERC20.sol';
import {IBond} from '../../layer_2/interfaces/bond/IBond.sol';
import {IEquity} from '../../layer_2/interfaces/equity/IEquity.sol';
import {
    FactoryRegulationData,
    RegulationData,
    RegulationType,
    RegulationSubType
} from '../../layer_3/constants/regulation.sol';

interface IFactory {
    enum SecurityType {
        Bond,
        Equity
    }

    // TODO: Separete common data in new struct
    struct SecurityData {
        bool isMultiPartition;
        IBusinessLogicResolver resolver;
        bytes32[] businessLogicKeys;
        IDiamond.Rbac[] rbacs;
        bool isControllable;
        bool isWhiteList;
        uint256 maxSupply;
        ERC20.ERC20MetadataInfo erc20MetadataInfo;
    }

    struct EquityData {
        SecurityData security;
        IEquity.EquityDetailsData equityDetails;
    }

    struct BondData {
        SecurityData security;
        IBond.BondDetailsData bondDetails;
        IBond.CouponDetailsData couponDetails;
    }

    event EquityDeployed(
        address indexed deployer,
        address equityAddress,
        EquityData equityData,
        FactoryRegulationData regulationData
    );

    event BondDeployed(
        address indexed deployer,
        address bondAddress,
        BondData bondData,
        FactoryRegulationData regulationData
    );

    error EmptyResolver(IBusinessLogicResolver resolver);
    error WrongISIN(string isin);
    error NoInitialAdmins();

    function deployEquity(
        EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address equityAddress_);

    function deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address bondAddress_);

    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory regulationData_);
}
