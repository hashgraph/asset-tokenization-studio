// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {
    buildRegulationData,
    buildDealSize,
    buildAccreditedInvestors,
    buildMaxNonAccreditedInvestors,
    buildManualInvestorVerification,
    buildInternationalInvestors,
    buildResaleHoldPeriod,
    checkRegulationTypeAndSubType,
    isValidTypeAndSubType,
    isValidTypeAndSubTypeForRegS,
    isValidTypeAndSubTypeForRegD,
    RegulationType,
    RegulationSubType,
    RegulationData,
    AccreditedInvestors,
    ManualInvestorVerification,
    InternationalInvestors,
    ResaleHoldPeriod
} from "../factory/ERC3643/interfaces/regulation.sol";
/**
 * @notice Helper contract to expose regulation.sol pure functions for testing
 */
contract MockedRegulation {
    function testBuildRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory) {
        return buildRegulationData(_regulationType, _regulationSubType);
    }

    function testBuildDealSize(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (uint256) {
        return buildDealSize(_regulationType, _regulationSubType);
    }

    function testBuildAccreditedInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (AccreditedInvestors) {
        return buildAccreditedInvestors(_regulationType, _regulationSubType);
    }

    function testBuildMaxNonAccreditedInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (uint256) {
        return buildMaxNonAccreditedInvestors(_regulationType, _regulationSubType);
    }

    function testBuildManualInvestorVerification(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (ManualInvestorVerification) {
        return buildManualInvestorVerification(_regulationType, _regulationSubType);
    }

    function testBuildInternationalInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (InternationalInvestors) {
        return buildInternationalInvestors(_regulationType, _regulationSubType);
    }

    function testBuildResaleHoldPeriod(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (ResaleHoldPeriod) {
        return buildResaleHoldPeriod(_regulationType, _regulationSubType);
    }

    function testCheckRegulationTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure {
        checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return isValidTypeAndSubType(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubTypeForRegS(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return isValidTypeAndSubTypeForRegS(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubTypeForRegD(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return isValidTypeAndSubTypeForRegD(_regulationType, _regulationSubType);
    }
}
