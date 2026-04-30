// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable func-name-mixedcase
// solhint-disable private-vars-leading-underscore

import { IFactory } from "./IFactory.sol";
import { ResolverProxy } from "../infrastructure/proxy/ResolverProxy.sol";
import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { DEFAULT_ADMIN_ROLE } from "../constants/roles.sol";
import { IControlList } from "../facets/layer_1/controlList/IControlList.sol";
import { ICore } from "../facets/core/ICore.sol";
import { IERC20Votes } from "../facets/layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { IController } from "../facets/controller/IController.sol";
import { IERC1410 } from "../facets/layer_1/ERC1400/ERC1410/IERC1410.sol";
import { ICap } from "../facets/layer_1/cap/ICap.sol";
import { IMint } from "../facets/mint/IMint.sol";
import { IClearing } from "../facets/clearing/IClearing.sol";
import { IBusinessLogicResolver } from "../infrastructure/diamond/IBusinessLogicResolver.sol";
import {
    FactoryRegulationData,
    _buildRegulationData,
    RegulationData,
    RegulationType,
    RegulationSubType,
    _checkRegulationTypeAndSubType,
    AdditionalSecurityData
} from "../constants/regulation.sol";
import { IEquityUSA } from "../facets/layer_3/equityUSA/IEquityUSA.sol";
import { IBondUSA } from "../facets/layer_3/bondUSA/IBondUSA.sol";
import { IBondRead } from "../facets/layer_2/bond/IBondRead.sol";
import { IProceedRecipients } from "../facets/layer_2/proceedRecipient/IProceedRecipients.sol";
import { INominalValue } from "../facets/layer_2/nominalValue/INominalValue.sol";
import { ScheduledTasksStorageWrapper } from "../domain/asset/ScheduledTasksStorageWrapper.sol";
import { IProtectedPartitions } from "../facets/layer_1/protectedPartition/IProtectedPartitions.sol";
import { IExternalPauseManagement } from "../facets/layer_1/externalPause/IExternalPauseManagement.sol";
import {
    IExternalControlListManagement
} from "../facets/layer_1/externalControlList/IExternalControlListManagement.sol";
import { IExternalKycListManagement } from "../facets/layer_1/externalKycList/IExternalKycListManagement.sol";
import { IKyc } from "../facets/layer_1/kyc/IKyc.sol";
import { IERC3643 } from "../facets/layer_1/ERC3643/IERC3643.sol";
import { _validateISIN } from "./isinValidator.sol";
import { IFixedRate } from "../facets/layer_2/interestRate/fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";
import { InterestRateStorageWrapper } from "../domain/asset/InterestRateStorageWrapper.sol";
/* solhint-disable max-line-length */
import {
    ISustainabilityPerformanceTargetRate
} from "../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { EvmAccessors } from "../infrastructure/utils/EvmAccessors.sol";
import { DatesValidation } from "../infrastructure/utils/DatesValidation.sol";
/* solhint-enable max-line-length */

contract Factory is IFactory {
    modifier checkResolver(IBusinessLogicResolver resolver) {
        if (address(resolver) == address(0)) {
            revert EmptyResolver(resolver);
        }
        _;
    }

    modifier checkISIN(string calldata isin) {
        _validateISIN(isin);
        _;
    }

    modifier checkAdmins(IResolverProxy.Rbac[] calldata rbacs) {
        bool adminFound;

        // Looking for admin role within initialization rbacas in order to add the factory
        for (uint256 rbacsIndex = 0; rbacsIndex < rbacs.length; rbacsIndex++) {
            if (rbacs[rbacsIndex].role == DEFAULT_ADMIN_ROLE) {
                if (rbacs[rbacsIndex].members.length > 0) {
                    for (
                        uint256 adminMemberIndex = 0;
                        adminMemberIndex < rbacs[rbacsIndex].members.length;
                        adminMemberIndex++
                    ) {
                        if (rbacs[rbacsIndex].members[adminMemberIndex] != address(0)) {
                            adminFound = true;
                            break;
                        }
                    }
                    if (adminFound) {
                        break;
                    }
                }
            }
        }

        if (!adminFound) {
            revert NoInitialAdmins();
        }
        _;
    }

    modifier checkRegulation(RegulationType _regulationType, RegulationSubType _regulationSubType) {
        _checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
        _;
    }

    modifier checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
        _;
    }

    modifier checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
        _;
    }

    modifier checkBondDates(uint256 startingDate, uint256 maturityDate) {
        _checkBondDates(startingDate, maturityDate);
        _;
    }

    function deployProxy(
        IBusinessLogicResolver _resolver,
        bytes32 _configKey,
        uint256 _version,
        IResolverProxy.Rbac[] calldata _rbacs
    ) external checkResolver(_resolver) checkAdmins(_rbacs) returns (address proxyAddress_) {
        proxyAddress_ = address(new ResolverProxy(_resolver, _configKey, _version, _rbacs));
        emit ProxyDeployed(proxyAddress_, _resolver, _configKey, _version, _rbacs);
    }

    function deployEquity(
        EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    )
        external
        checkResolver(_equityData.security.resolver)
        checkISIN(_equityData.security.erc20MetadataInfo.isin)
        checkAdmins(_equityData.security.rbacs)
        checkRegulation(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType)
        returns (address equityAddress_)
    {
        equityAddress_ = _deploySecurity(_equityData.security, SecurityType.Equity);

        // Initialize equity USA features (EquityUSAFacet may not be present)
        _tryInitialize_equityUSA(
            equityAddress_,
            _equityData.equityDetails,
            _buildRegulationData(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType),
            _factoryRegulationData.additionalSecurityData
        );

        _tryInitialize_NominalValue(
            equityAddress_,
            _equityData.equityDetails.nominalValue,
            _equityData.equityDetails.nominalValueDecimals
        );

        emit EquityDeployed(EvmAccessors.getMsgSender(), equityAddress_, _equityData, _factoryRegulationData);
    }

    function deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData
    )
        external
        checkResolver(_bondData.security.resolver)
        checkISIN(_bondData.security.erc20MetadataInfo.isin)
        checkAdmins(_bondData.security.rbacs)
        checkRegulation(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType)
        checkBondDates(_bondData.bondDetails.startingDate, _bondData.bondDetails.maturityDate)
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBond(_bondData, _factoryRegulationData, SecurityType.BondVariableRate);

        emit BondDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondData, _factoryRegulationData);
    }

    function deployBondFixedRate(
        BondFixedRateData calldata _bondFixedRateData
    )
        external
        checkResolver(_bondFixedRateData.bondData.security.resolver)
        checkISIN(_bondFixedRateData.bondData.security.erc20MetadataInfo.isin)
        checkAdmins(_bondFixedRateData.bondData.security.rbacs)
        checkRegulation(
            _bondFixedRateData.factoryRegulationData.regulationType,
            _bondFixedRateData.factoryRegulationData.regulationSubType
        )
        checkBondDates(
            _bondFixedRateData.bondData.bondDetails.startingDate,
            _bondFixedRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBond(
            _bondFixedRateData.bondData,
            _bondFixedRateData.factoryRegulationData,
            SecurityType.BondFixedRate
        );

        // Initialize fixed rate (FixedRateFacet may not be present)
        _tryInitialize_FixedRate(bondAddress_, _bondFixedRateData.fixedRateData);

        emit BondFixedRateDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondFixedRateData);
    }

    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    )
        external
        checkResolver(_bondKpiLinkedRateData.bondData.security.resolver)
        checkISIN(_bondKpiLinkedRateData.bondData.security.erc20MetadataInfo.isin)
        checkAdmins(_bondKpiLinkedRateData.bondData.security.rbacs)
        checkRegulation(
            _bondKpiLinkedRateData.factoryRegulationData.regulationType,
            _bondKpiLinkedRateData.factoryRegulationData.regulationSubType
        )
        checkInterestRate(_bondKpiLinkedRateData.interestRate)
        checkImpactData(_bondKpiLinkedRateData.impactData)
        checkBondDates(
            _bondKpiLinkedRateData.bondData.bondDetails.startingDate,
            _bondKpiLinkedRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBondKpiLinkedRate(_bondKpiLinkedRateData);
        _emitBondKpiLinkedRateDeployed(bondAddress_, _bondKpiLinkedRateData);
    }

    function deployBondSustainabilityPerformanceTargetRate(
        BondSustainabilityPerformanceTargetRateData calldata _bondSustainabilityPerformanceTargetRateData
    )
        external
        checkResolver(_bondSustainabilityPerformanceTargetRateData.bondData.security.resolver)
        checkISIN(_bondSustainabilityPerformanceTargetRateData.bondData.security.erc20MetadataInfo.isin)
        checkAdmins(_bondSustainabilityPerformanceTargetRateData.bondData.security.rbacs)
        checkRegulation(
            _bondSustainabilityPerformanceTargetRateData.factoryRegulationData.regulationType,
            _bondSustainabilityPerformanceTargetRateData.factoryRegulationData.regulationSubType
        )
        checkBondDates(
            _bondSustainabilityPerformanceTargetRateData.bondData.bondDetails.startingDate,
            _bondSustainabilityPerformanceTargetRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBondSustainabilityPerformanceTargetRate(_bondSustainabilityPerformanceTargetRateData);
        emit BondSustainabilityPerformanceTargetRateDeployed(
            EvmAccessors.getMsgSender(),
            bondAddress_,
            _bondSustainabilityPerformanceTargetRateData
        );
    }

    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure override returns (RegulationData memory regulationData_) {
        regulationData_ = _buildRegulationData(_regulationType, _regulationSubType);
    }

    function _deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData,
        SecurityType _securityType
    ) internal returns (address bondAddress_) {
        bondAddress_ = _deploySecurity(_bondData.security, _securityType);

        // Initialize bond USA features (BondUSAFacet may not be present)
        _tryInitialize_bondUSA(
            bondAddress_,
            _bondData.bondDetails,
            _buildRegulationData(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType),
            _factoryRegulationData.additionalSecurityData
        );

        // Initialize proceed recipients (ProceedRecipientsFacet may not be present)
        _tryInitialize_ProceedRecipients(bondAddress_, _bondData.proceedRecipients, _bondData.proceedRecipientsData);

        _tryInitialize_NominalValue(
            bondAddress_,
            _bondData.bondDetails.nominalValue,
            _bondData.bondDetails.nominalValueDecimals
        );
    }

    function _deployBondKpiLinkedRate(BondKpiLinkedRateData calldata _data) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, _data.factoryRegulationData, SecurityType.BondKpiLinkedRate);

        // Initialize KPI linked rate (KpiLinkedRateFacet may not be present)
        _tryInitialize_KpiLinkedRate(bondAddress_, _data.interestRate, _data.impactData);
    }

    function _deployBondSustainabilityPerformanceTargetRate(
        BondSustainabilityPerformanceTargetRateData calldata _data
    ) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, _data.factoryRegulationData, SecurityType.BondSPTRate);

        // Initialize sustainability performance target rate
        // (SustainabilityPerformanceTargetRateFacet may not be present)
        _tryInitialize_SustainabilityPerformanceTargetRate(
            bondAddress_,
            _data.interestRate,
            _data.impactData,
            _data.projects
        );
    }

    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) private returns (address securityAddress_) {
        ResolverProxy equity = new ResolverProxy(
            _securityData.resolver,
            _securityData.resolverProxyConfiguration.key,
            _securityData.resolverProxyConfiguration.version,
            _securityData.rbacs
        );

        securityAddress_ = address(equity);

        // configure Control List
        IControlList(securityAddress_).initializeControlList(_securityData.isWhiteList);

        // configure multi partition flag (ERC1410ManagementFacet may not be present)
        _tryInitialize_ERC1410(securityAddress_, _securityData.isMultiPartition);

        // configure controller flag (ControllerFacet may not be present)
        _tryInitializeController(securityAddress_, _securityData.isControllable);

        // configure erc20 metadata (CoreFacet may not be present)
        ICore.ERC20Metadata memory erc20Metadata = ICore.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });
        ICore(securityAddress_).initializeCore(erc20Metadata);

        // configure issue flag (ERC1594Facet may not be present)
        _tryInitialize_ERC1594(securityAddress_);

        // configure cap (CapFacet should be present)
        ICap(securityAddress_).initialize_Cap(_securityData.maxSupply, new ICap.PartitionCap[](0));

        // configure protected partitions (should be present)
        IProtectedPartitions(securityAddress_).initialize_ProtectedPartitions(_securityData.arePartitionsProtected);

        // configure clearing (ClearingFacet may not be present)
        _tryInitializeClearing(securityAddress_, _securityData.clearingActive);

        // configure external pauses (should be present)
        IExternalPauseManagement(securityAddress_).initialize_ExternalPauses(_securityData.externalPauses);

        // configure external control lists (should be present)
        IExternalControlListManagement(securityAddress_).initialize_ExternalControlLists(
            _securityData.externalControlLists
        );

        // configure internal KYC (should be present)
        IKyc(securityAddress_).initializeInternalKyc(_securityData.internalKycActivated);

        // configure external KYC lists (should be present)
        IExternalKycListManagement(securityAddress_).initialize_ExternalKycLists(_securityData.externalKycLists);

        // configure ERC20Votes (ERC20VotesFacet may not be present)
        _tryInitialize_ERC20Votes(securityAddress_, _securityData.erc20VotesActivated);

        // configure ERC3643 (should be present)
        IERC3643(securityAddress_).initialize_ERC3643(_securityData.compliance, _securityData.identityRegistry);
    }

    function _tryInitialize_ERC1410(address securityAddress_, bool isMultiPartition) private {
        try IERC1410(securityAddress_).initialize_ERC1410(isMultiPartition) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeController(address securityAddress_, bool isControllable) private {
        try IController(securityAddress_).initializeController(isControllable) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitialize_ERC1594(address securityAddress_) private {
        try IMint(securityAddress_).initialize_ERC1594() {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeClearing(address securityAddress_, bool clearingActive) private {
        try IClearing(securityAddress_).initializeClearing(clearingActive) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitialize_ERC20Votes(address securityAddress_, bool erc20VotesActivated) private {
        try IERC20Votes(securityAddress_).initialize_ERC20Votes(erc20VotesActivated) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitialize_equityUSA(
        address securityAddress_,
        IEquityUSA.EquityDetailsData calldata equityDetailsData,
        RegulationData memory regulationData,
        AdditionalSecurityData calldata additionalSecurityData
    ) private {
        try
            IEquityUSA(securityAddress_)._initialize_equityUSA(
                equityDetailsData,
                regulationData,
                additionalSecurityData
            )
        {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitialize_bondUSA(
        address securityAddress_,
        IBondRead.BondDetailsData calldata bondDetailsData,
        RegulationData memory regulationData,
        AdditionalSecurityData calldata additionalSecurityData
    ) private {
        try IBondUSA(securityAddress_)._initialize_bondUSA(bondDetailsData, regulationData, additionalSecurityData) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitialize_FixedRate(
        address securityAddress_,
        IFixedRate.FixedRateData calldata fixedRateData
    ) private {
        try IFixedRate(securityAddress_).initialize_FixedRate(fixedRateData) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitialize_KpiLinkedRate(
        address securityAddress_,
        IKpiLinkedRate.InterestRate calldata interestRate,
        IKpiLinkedRate.ImpactData calldata impactData
    ) private {
        try IKpiLinkedRate(securityAddress_).initialize_KpiLinkedRate(interestRate, impactData) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitialize_SustainabilityPerformanceTargetRate(
        address securityAddress_,
        ISustainabilityPerformanceTargetRate.InterestRate calldata interestRate,
        ISustainabilityPerformanceTargetRate.ImpactData[] calldata impactData,
        address[] calldata projects
    ) private {
        try
            ISustainabilityPerformanceTargetRate(securityAddress_).initialize_SustainabilityPerformanceTargetRate(
                interestRate,
                impactData,
                projects
            )
        {
            // success
        } catch (bytes memory reason) {
            // Re-revert if the facet is present but initialization failed (non-empty revert data)
            if (reason.length > 0) {
                // solhint-disable-next-line no-inline-assembly
                assembly {
                    revert(add(reason, 32), mload(reason))
                }
            }
            // Empty revert data means facet not present - skip initialization
        }
    }

    function _tryInitialize_ProceedRecipients(
        address securityAddress_,
        address[] calldata proceedRecipients,
        bytes[] calldata data
    ) private {
        try IProceedRecipients(securityAddress_).initialize_ProceedRecipients(proceedRecipients, data) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitialize_NominalValue(
        address securityAddress_,
        uint256 nominalValue,
        uint8 nominalValueDecimals
    ) private {
        try INominalValue(securityAddress_).initialize_NominalValue(nominalValue, nominalValueDecimals) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _emitBondKpiLinkedRateDeployed(
        address _bondAddress,
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) private {
        emit BondKpiLinkedRateDeployed(EvmAccessors.getMsgSender(), _bondAddress, _bondKpiLinkedRateData);
    }

    function _checkBondDates(uint256 startingDate, uint256 maturityDate) private view {
        DatesValidation.checkDates(startingDate, maturityDate);
        ScheduledTasksStorageWrapper.requireValidTimestamp(maturityDate);
    }
}
