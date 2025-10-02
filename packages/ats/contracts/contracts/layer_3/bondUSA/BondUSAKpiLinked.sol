// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    BondKpiLinkedInterestRate
} from '../../layer_2/bond/kpiLinkedInterestRate/Bond.sol';
import {IBondRead} from '../../layer_2/interfaces/bond/IBondRead.sol';
import {IBondUSA} from '../interfaces/IBondUSA.sol';
import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';

abstract contract BondUSAKpiLinked is IBondUSA, BondKpiLinkedInterestRate {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        IBondRead.BondDetailsData calldata _bondDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override onlyUninitialized(_bondStorage().initialized) {
        _initialize_bond(_bondDetailsData);
        _initializeSecurity(_regulationData, _additionalSecurityData);
    }
}
