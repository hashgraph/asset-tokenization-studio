// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// solhint-disable no-global-import
import '@tokenysolutions/t-rex/contracts/factory/TREXFactory.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import {TRexIFactory, FactoryRegulationData} from '../interfaces/IFactory.sol';
import '@onchain-id/solidity/contracts/factory/IIdFactory.sol';
import {TREXFactoryAts} from '../TREXFactory.sol';
import {SecurityDeploymentLib} from './core/SecurityDeploymentLib.sol';
import {TREXBaseDeploymentLib} from './core/TREXBaseDeploymentLib.sol';

library TREXEquityDeploymentLib {
    function deployTREXSuiteAtsEquity(
        mapping(string => address) storage _tokenDeployed,
        address _implementationAuthority,
        address _idFactory,
        address _atsFactory,
        string memory _salt,
        TREXFactoryAts.TokenDetailsAts calldata _tokenDetails,
        ITREXFactory.ClaimDetails calldata _claimDetails,
        TRexIFactory.EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address) {
        IToken token = SecurityDeploymentLib.deployEquity(
            _atsFactory,
            _tokenDetails.owner,
            _equityData,
            _factoryRegulationData
        );
        TREXBaseDeploymentLib.deployTREXSuite(
            _tokenDeployed,
            _implementationAuthority,
            _idFactory,
            _salt,
            _tokenDetails,
            _claimDetails,
            token,
            _equityData.security.identityRegistry,
            _equityData.security.compliance
        );
        return (address(token));
    }
}
