// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {
    LibRegulation,
    RegulationType,
    RegulationSubType,
    RegulationData,
    AccreditedInvestors,
    ManualInvestorVerification,
    InternationalInvestors,
    ResaleHoldPeriod
} from "../lib/domain/LibRegulation.sol";
/**
 * @notice Helper contract to expose regulation.sol pure functions for testing
 */
contract MockedRegulation {
    function testBuildRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory) {
        return LibRegulation.buildRegulationData(_regulationType, _regulationSubType);
    }

    function testBuildDealSize(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (uint256) {
        return LibRegulation.buildDealSize(_regulationType, _regulationSubType);
    }

    function testBuildAccreditedInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (AccreditedInvestors) {
        return LibRegulation.buildAccreditedInvestors(_regulationType, _regulationSubType);
    }

    function testBuildMaxNonAccreditedInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (uint256) {
        return LibRegulation.buildMaxNonAccreditedInvestors(_regulationType, _regulationSubType);
    }

    function testBuildManualInvestorVerification(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (ManualInvestorVerification) {
        return LibRegulation.buildManualInvestorVerification(_regulationType, _regulationSubType);
    }

    function testBuildInternationalInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (InternationalInvestors) {
        return LibRegulation.buildInternationalInvestors(_regulationType, _regulationSubType);
    }

    function testBuildResaleHoldPeriod(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (ResaleHoldPeriod) {
        return LibRegulation.buildResaleHoldPeriod(_regulationType, _regulationSubType);
    }

    function testCheckRegulationTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure {
        LibRegulation.checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return LibRegulation.isValidTypeAndSubType(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubTypeForRegS(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return LibRegulation.isValidTypeAndSubTypeForRegS(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubTypeForRegD(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return LibRegulation.isValidTypeAndSubTypeForRegD(_regulationType, _regulationSubType);
    }
}
