// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Bond} from '../../layer_2/bond/Bond.sol';
import {IBondRead} from '../../layer_2/interfaces/bond/IBondRead.sol';
import {IBondUSA} from '../interfaces/IBondUSA.sol';
import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';

abstract contract BondUSA is IBondUSA, Bond {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        IBondRead.BondDetailsData calldata _bondDetailsData,
        IBondRead.InterestRateTypes _interestRateType,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override onlyUninitialized(_bondStorage().initialized) {
        _initialize_bond(_bondDetailsData, _interestRateType);
        _initializeSecurity(_regulationData, _additionalSecurityData);
    }
}
