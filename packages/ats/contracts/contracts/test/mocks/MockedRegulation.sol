// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {
    _buildRegulationData,
    _buildDealSize,
    _buildAccreditedInvestors,
    _buildMaxNonAccreditedInvestors,
    _buildManualInvestorVerification,
    _buildInternationalInvestors,
    _buildResaleHoldPeriod,
    _checkRegulationTypeAndSubType,
    _isValidTypeAndSubType,
    _isValidTypeAndSubTypeForRegS,
    _isValidTypeAndSubTypeForRegD,
    RegulationType,
    RegulationSubType,
    RegulationData,
    AccreditedInvestors,
    ManualInvestorVerification,
    InternationalInvestors,
    ResaleHoldPeriod
} from "../../factory/ERC3643/interfaces/regulation.sol";
/**
 * @notice Helper contract to expose regulation.sol pure functions for testing
 */
contract MockedRegulation {
    function testBuildRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (RegulationData memory) {
        return _buildRegulationData(_regulationType, _regulationSubType);
    }

    function testBuildDealSize(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (uint256) {
        return _buildDealSize(_regulationType, _regulationSubType);
    }

    function testBuildAccreditedInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (AccreditedInvestors) {
        return _buildAccreditedInvestors(_regulationType, _regulationSubType);
    }

    function testBuildMaxNonAccreditedInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (uint256) {
        return _buildMaxNonAccreditedInvestors(_regulationType, _regulationSubType);
    }

    function testBuildManualInvestorVerification(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (ManualInvestorVerification) {
        return _buildManualInvestorVerification(_regulationType, _regulationSubType);
    }

    function testBuildInternationalInvestors(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (InternationalInvestors) {
        return _buildInternationalInvestors(_regulationType, _regulationSubType);
    }

    function testBuildResaleHoldPeriod(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (ResaleHoldPeriod) {
        return _buildResaleHoldPeriod(_regulationType, _regulationSubType);
    }

    function testCheckRegulationTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure {
        _checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return _isValidTypeAndSubType(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubTypeForRegS(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return _isValidTypeAndSubTypeForRegS(_regulationType, _regulationSubType);
    }

    function testIsValidTypeAndSubTypeForRegD(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure returns (bool) {
        return _isValidTypeAndSubTypeForRegD(_regulationType, _regulationSubType);
    }
}
