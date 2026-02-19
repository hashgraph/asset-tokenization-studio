// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ISustainabilityPerformanceTargetRate {
    struct InterestRate {
        uint256 baseRate;
        uint256 startPeriod;
        uint256 startRate;
        uint8 rateDecimals;
    }

    enum BaseLineMode {
        MINIMUM,
        MAXIMUM
    }

    enum ImpactDataMode {
        PENALTY,
        BONUS
    }

    struct ImpactData {
        uint256 baseLine;
        BaseLineMode baseLineMode;
        uint256 deltaRate;
        ImpactDataMode impactDataMode;
    }

    event InterestRateUpdated(address indexed operator, InterestRate newInterestRate);
    event ImpactDataUpdated(address indexed operator, ImpactData[] newImpactData, address[] projects);

    error NotExistingProject(address);
    error ProvidedListsLengthMismatch(uint256 impactDataLength, uint256 projectsLength);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_SustainabilityPerformanceTargetRate(
        InterestRate calldata _interestRate,
        ImpactData[] calldata _impactData,
        address[] calldata _projects
    ) external;

    function setInterestRate(InterestRate calldata _newInterestRate) external;
    function setImpactData(ImpactData[] calldata _newImpactData, address[] calldata projects) external;

    function getInterestRate() external view returns (InterestRate memory interestRate_);
    function getImpactDataFor(address _project) external view returns (ImpactData memory impactData_);
}
