// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IEquity} from '../../layer_2/interfaces/equity/IEquity.sol';
import {ISecurity} from './ISecurity.sol';
import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';

interface IEquityUSA is IEquity, ISecurity {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_equityUSA(
        EquityDetailsData calldata _equityDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external returns (bool);
}
