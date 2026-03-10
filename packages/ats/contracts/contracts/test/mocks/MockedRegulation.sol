// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {
    Regulation,
    RegulationType,
    RegulationSubType,
    RegulationData,
    AccreditedInvestors,
    ManualInvestorVerification,
    InternationalInvestors,
    ResaleHoldPeriod
} from "../../domain/asset/Regulation.sol";
/**
 * @notice Helper contract to expose regulation.sol pure functions for testing
 */
contract MockedRegulation {
    function testBuildRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory) {
        return Regulation.buildRegulationData(_regulationType, _regulationSubType);
    }

    function testBuildDealSize(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (uint256) {
        return Regulation.buildDealSize(_regulationType, _regulationSubType);
    }

    function testBuildAccreditedInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (AccreditedInvestors) {
        return Regulation.buildAccreditedInvestors(_regulationType, _regulationSubType);
    }

    function testBuildMaxNonAccreditedInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (uint256) {
        return Regulation.buildMaxNonAccreditedInvestors(_regulationType, _regulationSubType);
    }

    function testBuildManualInvestorVerification(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (ManualInvestorVerification) {
        return Regulation.buildManualInvestorVerification(_regulationType, _regulationSubType);
    }

    function testBuildInternationalInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (InternationalInvestors) {
        return Regulation.buildInternationalInvestors(_regulationType, _regulationSubType);
    }

    function testBuildResaleHoldPeriod(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (ResaleHoldPeriod) {
        return Regulation.buildResaleHoldPeriod(_regulationType, _regulationSubType);
    }

    function testCheckRegulationTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure {
        Regulation.checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return Regulation.isValidTypeAndSubType(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubTypeForRegS(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return Regulation.isValidTypeAndSubTypeForRegS(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubTypeForRegD(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return Regulation.isValidTypeAndSubTypeForRegD(_regulationType, _regulationSubType);
    }
}
