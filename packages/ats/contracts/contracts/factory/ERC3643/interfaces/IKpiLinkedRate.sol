// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface TRexIKpiLinkedRate {
    struct InterestRate {
        uint256 maxRate;
        uint256 baseRate;
        uint256 minRate;
        uint256 startPeriod;
        uint256 startRate;
        uint256 missedPenalty;
        uint256 reportPeriod;
        uint8 rateDecimals;
    }
    struct ImpactData {
        uint256 maxDeviationCap;
        uint256 baseLine;
        uint256 maxDeviationFloor;
        uint8 impactDataDecimals;
        uint256 adjustmentPrecision;
    }

    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);
    event ImpactDataUpdated(address indexed operator, ImpactData newImpactData);

    error WrongInterestRateValues(InterestRate interestRate);
    error WrongImpactDataValues(ImpactData impactData);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(InterestRate calldata _interestRate, ImpactData calldata _impactData) external;

    function setInterestRate(InterestRate calldata _newInterestRate) external;
    function setImpactData(ImpactData calldata _newImpactData) external;

    function getInterestRate() external view returns (InterestRate memory interestRate_);
    function getImpactData() external view returns (ImpactData memory impactData_);
}
