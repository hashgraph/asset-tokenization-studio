// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IBond} from '../../layer_2/interfaces/bond/IBond.sol';
import {ISecurity} from './ISecurity.sol';
import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';

interface IBondUSA is IBond, ISecurity {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_bondUSA(
        BondDetailsData calldata _bondDetailsData,
        CouponDetailsData calldata _couponDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external returns (bool);
}
