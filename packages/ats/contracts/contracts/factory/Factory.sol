// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable func-name-mixedcase
// solhint-disable private-vars-leading-underscore

import { IFactory } from "./IFactory.sol";
import { ResolverProxy } from "../infrastructure/proxy/ResolverProxy.sol";
import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { _DEFAULT_ADMIN_ROLE } from "../constants/roles.sol";
import { IControlList } from "../facets/layer_1/controlList/IControlList.sol";
import { IERC20 } from "../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { IERC20Votes } from "../facets/layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { IERC1644 } from "../facets/layer_1/ERC1400/ERC1644/IERC1644.sol";
import { IERC1410 } from "../facets/layer_1/ERC1400/ERC1410/IERC1410.sol";
import { ICap } from "../facets/layer_1/cap/ICap.sol";
import { IERC1594 } from "../facets/layer_1/ERC1400/ERC1594/IERC1594.sol";
import { IClearingActions } from "../facets/layer_1/clearing/IClearingActions.sol";
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

/**
 * @title  Factory
 * @notice Deploys and initialises ERC-2535 diamond proxy instances for equity and bond
 *         security tokens, including all standard and optional facet configurations.
 * @dev    Implements `IFactory`. Each deployment creates a new `ResolverProxy` and
 *         sequentially invokes initialisation functions on required and optional facets.
 *         Optional facets are initialised via `try/catch` patterns; a failed call due
 *         to an absent facet is silently ignored. A failed call with non-empty revert
 *         data (indicating a present but failing facet) is re-reverted only for
 *         `SustainabilityPerformanceTargetRate`; all other optional initialisers swallow
 *         revert data. Callers should be aware of this asymmetry when debugging.
 *
 *         Deployment prerequisites enforced via modifiers:
 *           - `checkResolver`  — resolver address must be non-zero.
 *           - `checkISIN`      — ISIN string must pass format validation.
 *           - `checkAdmins`    — at least one non-zero `_DEFAULT_ADMIN_ROLE` member must
 *                               be present in the RBAC initialisation array.
 *           - `checkRegulation` — regulation type/subtype combination must be valid.
 *           - `checkBondDates`  — starting date must precede maturity date; maturity
 *                                 date must pass `ScheduledTasksStorageWrapper`
 *                                 timestamp validation.
 *           - `checkInterestRate` / `checkImpactData` — rate and impact data structs
 *                                 must pass field-level validation.
 *
 *         The factory does not retain ownership of deployed proxies; the caller becomes
 *         the deployer and the RBAC configuration passed at deployment governs access.
 * @author Hashgraph
 */
contract Factory is IFactory {
    /**
     * @notice Reverts if the provided resolver address is the zero address.
     * @dev    Applied to all deploy functions that accept a resolver parameter to
     *         prevent deployment against an uninitialised resolver. Reverts with
     *         `EmptyResolver`.
     * @param resolver  The `IBusinessLogicResolver` instance to validate.
     */
    modifier checkResolver(IBusinessLogicResolver resolver) {
        if (address(resolver) == address(0)) {
            revert EmptyResolver(resolver);
        }
        _;
    }

    /**
     * @notice Reverts if the provided ISIN string fails format validation.
     * @dev    Delegates to `_validateISIN`. The exact validation rules are defined in
     *         `isinValidator.sol`. Applied to all security token deployments.
     * @param isin  ISIN string to validate.
     */
    modifier checkISIN(string calldata isin) {
        _validateISIN(isin);
        _;
    }

    /**
     * @notice Reverts if the RBAC initialisation array contains no non-zero member
     *         assigned to `_DEFAULT_ADMIN_ROLE`.
     * @dev    Scans the `rbacs` array for the first entry with role equal to
     *         `_DEFAULT_ADMIN_ROLE` that contains at least one non-zero member address.
     *         Reverts with `NoInitialAdmins` if none is found. This prevents deploying
     *         a token with no reachable administrator.
     * @param rbacs  Array of RBAC configuration structs provided to the proxy on
     *               deployment.
     */
    modifier checkAdmins(IResolverProxy.Rbac[] calldata rbacs) {
        bool adminFound;
        // Looking for admin role within initialization rbacas in order to add the factory
        for (uint256 rbacsIndex = 0; rbacsIndex < rbacs.length; rbacsIndex++) {
            if (rbacs[rbacsIndex].role == _DEFAULT_ADMIN_ROLE) {
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

    /**
     * @notice Reverts if the regulation type and subtype combination is invalid.
     * @dev    Delegates to `_checkRegulationTypeAndSubType` from `regulation.sol`.
     *         Applied to all security token deployments that carry regulation data.
     * @param _regulationType     The primary regulation classification to validate.
     * @param _regulationSubType  The secondary regulation classification to validate.
     */
    modifier checkRegulation(RegulationType _regulationType, RegulationSubType _regulationSubType) {
        _checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
        _;
    }

    /**
     * @notice Reverts if the provided interest rate struct fails field-level validation.
     * @dev    Delegates to `InterestRateStorageWrapper.requireValidInterestRate`.
     *         Applied to KPI-linked rate bond deployments.
     * @param _newInterestRate  Interest rate struct to validate.
     */
    modifier checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
        _;
    }

    /**
     * @notice Reverts if the provided impact data struct fails field-level validation.
     * @dev    Delegates to `InterestRateStorageWrapper.requireValidImpactData`.
     *         Applied to KPI-linked rate bond deployments.
     * @param _newImpactData  Impact data struct to validate.
     */
    modifier checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
        _;
    }

    /**
     * @notice Reverts if the bond starting date does not precede the maturity date, or
     *         if the maturity date fails timestamp validation.
     * @dev    Delegates to `_checkBondDates`, which calls `DatesValidation.checkDates`
     *         and `ScheduledTasksStorageWrapper.requireValidTimestamp`. Applied to all
     *         bond deployment functions.
     * @param startingDate  Unix timestamp of the bond's intended start date.
     * @param maturityDate  Unix timestamp of the bond's maturity date.
     */
    modifier checkBondDates(uint256 startingDate, uint256 maturityDate) {
        _checkBondDates(startingDate, maturityDate);
        _;
    }

    /**
     * @notice Deploys a generic `ResolverProxy` instance without any security-specific
     *         initialisation.
     * @dev    Requires `resolver` to be non-zero and `rbacs` to contain at least one
     *         non-zero `_DEFAULT_ADMIN_ROLE` member. The deployed proxy is entirely
     *         configured by the caller-supplied RBAC array and configuration key/version.
     *         Emits: `IFactory.ProxyDeployed`.
     * @param _resolver   Business logic resolver that the proxy will delegate to.
     * @param _configKey  Configuration key identifying the facet configuration.
     * @param _version    Version identifier for the resolver configuration.
     * @param _rbacs      RBAC initialisation array; must include at least one admin.
     * @return proxyAddress_  Address of the newly deployed `ResolverProxy`.
     */
    function deployProxy(
        IBusinessLogicResolver _resolver,
        bytes32 _configKey,
        uint256 _version,
        IResolverProxy.Rbac[] calldata _rbacs
    ) external checkResolver(_resolver) checkAdmins(_rbacs) returns (address proxyAddress_) {
        proxyAddress_ = address(new ResolverProxy(_resolver, _configKey, _version, _rbacs));
        emit ProxyDeployed(proxyAddress_, _resolver, _configKey, _version, _rbacs);
    }

    /**
     * @notice Deploys and fully initialises an equity security token proxy.
     * @dev    Orchestrates deployment via `_deploySecurity` then attempts optional
     *         initialisation of equity USA features (`_tryInitialize_equityUSA`) and the
     *         nominal value module (`_tryInitialize_NominalValue`). Both are silently
     *         skipped if the corresponding facet is absent. All prerequisite modifiers
     *         apply: resolver, ISIN, admins, and regulation.
     *         Emits: `IFactory.EquityDeployed`.
     * @param _equityData             Calldata struct containing security configuration
     *                                and equity-specific details.
     * @param _factoryRegulationData  Calldata struct containing regulation type, subtype,
     *                                and additional security metadata.
     * @return equityAddress_  Address of the newly deployed equity token proxy.
     */
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

    /**
     * @notice Deploys and fully initialises a variable-rate bond security token proxy.
     * @dev    Delegates the bond deployment and shared initialisation to `_deployBond`
     *         with `SecurityType.BondVariableRate`. All prerequisite modifiers apply:
     *         resolver, ISIN, admins, regulation, and bond dates.
     *         Emits: `IFactory.BondDeployed`.
     * @param _bondData               Calldata struct containing security configuration,
     *                                bond details, and proceed recipient data.
     * @param _factoryRegulationData  Calldata struct containing regulation type, subtype,
     *                                and additional security metadata.
     * @return bondAddress_  Address of the newly deployed bond proxy.
     */
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

    /**
     * @notice Deploys and fully initialises a fixed-rate bond security token proxy,
     *         including the fixed interest rate module.
     * @dev    Delegates base bond deployment to `_deployBond` with
     *         `SecurityType.BondFixedRate`, then attempts optional fixed-rate
     *         initialisation via `_tryInitialize_FixedRate`. All prerequisite modifiers
     *         apply: resolver, ISIN, admins, regulation, and bond dates.
     *         Emits: `IFactory.BondFixedRateDeployed`.
     * @param _bondFixedRateData  Calldata struct bundling bond data, regulation data, and
     *                            fixed rate configuration.
     * @return bondAddress_  Address of the newly deployed fixed-rate bond proxy.
     */
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
        _tryInitialize_FixedRate(bondAddress_, _bondFixedRateData.fixedRateData);
        emit BondFixedRateDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondFixedRateData);
    }

    /**
     * @notice Deploys and fully initialises a KPI-linked rate bond security token proxy,
     *         including the KPI interest rate and impact data modules.
     * @dev    Delegates base bond deployment to `_deployBondKpiLinkedRate` with
     *         `SecurityType.BondKpiLinkedRate`. All prerequisite modifiers apply:
     *         resolver, ISIN, admins, regulation, interest rate, impact data, and bond
     *         dates. The event emission is extracted to `_emitBondKpiLinkedRateDeployed`
     *         to work around stack-depth constraints.
     *         Emits: `IFactory.BondKpiLinkedRateDeployed`.
     * @param _bondKpiLinkedRateData  Calldata struct bundling bond data, regulation data,
     *                                interest rate, and impact data.
     * @return bondAddress_  Address of the newly deployed KPI-linked rate bond proxy.
     */
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

    /**
     * @notice Deploys and fully initialises a sustainability performance target rate
     *         bond security token proxy.
     * @dev    Delegates base bond deployment to
     *         `_deployBondSustainabilityPerformanceTargetRate` with
     *         `SecurityType.BondSPTRate`. Unlike other optional initialisers, if the
     *         SPT rate facet is present but its initialisation reverts with non-empty
     *         data, the revert is propagated. All prerequisite modifiers apply: resolver,
     *         ISIN, admins, regulation, and bond dates.
     *         Emits: `IFactory.BondSustainabilityPerformanceTargetRateDeployed`.
     * @param _bondSustainabilityPerformanceTargetRateData  Calldata struct bundling bond
     *         data, regulation data, interest rate, impact data, and project addresses.
     * @return bondAddress_  Address of the newly deployed SPT rate bond proxy.
     */
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

    /**
     * @notice Returns the compiled `RegulationData` struct for a given regulation type
     *         and subtype combination.
     * @dev    Pure function; delegates entirely to `_buildRegulationData`. Does not
     *         validate the combination; callers should use `checkRegulation` if
     *         validation is required.
     * @param _regulationType     Primary regulation classification.
     * @param _regulationSubType  Secondary regulation classification.
     * @return regulationData_  The fully populated `RegulationData` struct for the
     *                          requested combination.
     */
    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure override returns (RegulationData memory regulationData_) {
        regulationData_ = _buildRegulationData(_regulationType, _regulationSubType);
    }

    /**
     * @notice Deploys a bond security proxy and initialises its core and optional
     *         bond-specific modules.
     * @dev    Internal shared implementation for all bond deployment variants.
     *         Calls `_deploySecurity` for the core proxy, then attempts optional
     *         initialisation of bond USA features, proceed recipients, and the nominal
     *         value module. All three optional modules are silently skipped if the
     *         corresponding facet is absent.
     * @param _bondData               Bond security configuration and bond detail data.
     * @param _factoryRegulationData  Regulation type, subtype, and additional metadata.
     * @param _securityType           Security type enum value for ERC20 metadata
     *                                classification.
     * @return bondAddress_  Address of the newly deployed bond proxy.
     */
    function _deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData,
        SecurityType _securityType
    ) internal returns (address bondAddress_) {
        bondAddress_ = _deploySecurity(_bondData.security, _securityType);
        _tryInitialize_bondUSA(
            bondAddress_,
            _bondData.bondDetails,
            _buildRegulationData(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType),
            _factoryRegulationData.additionalSecurityData
        );
        _tryInitialize_ProceedRecipients(bondAddress_, _bondData.proceedRecipients, _bondData.proceedRecipientsData);
        _tryInitialize_NominalValue(
            bondAddress_,
            _bondData.bondDetails.nominalValue,
            _bondData.bondDetails.nominalValueDecimals
        );
    }

    /**
     * @notice Deploys a KPI-linked rate bond proxy and attempts optional initialisation
     *         of the KPI rate and impact data modules.
     * @dev    Delegates base deployment to `_deployBond` with
     *         `SecurityType.BondKpiLinkedRate`, then calls `_tryInitialize_KpiLinkedRate`.
     *         The KPI rate initialisation is silently skipped if the facet is absent.
     * @param _data  Calldata struct bundling bond data, regulation data, interest rate,
     *               and impact data.
     * @return bondAddress_  Address of the newly deployed KPI-linked rate bond proxy.
     */
    function _deployBondKpiLinkedRate(BondKpiLinkedRateData calldata _data) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, _data.factoryRegulationData, SecurityType.BondKpiLinkedRate);
        _tryInitialize_KpiLinkedRate(bondAddress_, _data.interestRate, _data.impactData);
    }

    /**
     * @notice Deploys an SPT rate bond proxy and attempts optional initialisation of
     *         the sustainability performance target rate module.
     * @dev    Delegates base deployment to `_deployBond` with `SecurityType.BondSPTRate`,
     *         then calls `_tryInitialize_SustainabilityPerformanceTargetRate`. Unlike
     *         other optional initialisers, if the SPT rate facet is present but its
     *         initialisation reverts with non-empty data, the revert is propagated via
     *         inline assembly.
     * @param _data  Calldata struct bundling bond data, regulation data, interest rate,
     *               impact data, and project addresses.
     * @return bondAddress_  Address of the newly deployed SPT rate bond proxy.
     */
    function _deployBondSustainabilityPerformanceTargetRate(
        BondSustainabilityPerformanceTargetRateData calldata _data
    ) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, _data.factoryRegulationData, SecurityType.BondSPTRate);
        _tryInitialize_SustainabilityPerformanceTargetRate(
            bondAddress_,
            _data.interestRate,
            _data.impactData,
            _data.projects
        );
    }

    /**
     * @notice Deploys a `ResolverProxy` and sequentially initialises all required and
     *         optional facets for a security token.
     * @dev    Deployment and initialisation order is fixed and must not be altered, as
     *         some facets depend on prior configuration (e.g. ERC3643 requires the
     *         control list to be active). Required initialisations (those called
     *         directly rather than via `_tryInitialize_*`) will revert on failure.
     *         Optional initialisations silently skip absent facets.
     *
     *         Initialisation sequence:
     *           1. `IControlList.initializeControlList`       — required
     *           2. `_tryInitialize_ERC1410`                   — optional
     *           3. `_tryInitialize_ERC1644`                   — optional
     *           4. `_tryInitialize_ERC20`                     — optional
     *           5. `_tryInitialize_ERC1594`                   — optional
     *           6. `ICap.initialize_Cap`                      — required
     *           7. `IProtectedPartitions.initialize_ProtectedPartitions` — required
     *           8. `_tryInitializeClearing`                   — optional
     *           9. `IExternalPauseManagement.initialize_ExternalPauses` — required
     *          10. `IExternalControlListManagement.initialize_ExternalControlLists` — required
     *          11. `IKyc.initializeInternalKyc`               — required
     *          12. `IExternalKycListManagement.initialize_ExternalKycLists` — required
     *          13. `_tryInitialize_ERC20Votes`                — optional
     *          14. `IERC3643.initialize_ERC3643`              — required
     * @param _securityData  Calldata struct containing all configuration parameters for
     *                       the security proxy.
     * @param _securityType  Security type enum value passed to the ERC20 metadata.
     * @return securityAddress_  Address of the newly deployed and initialised security
     *                           proxy.
     */
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
        IControlList(securityAddress_).initializeControlList(_securityData.isWhiteList);
        _tryInitialize_ERC1410(securityAddress_, _securityData.isMultiPartition);
        _tryInitialize_ERC1644(securityAddress_, _securityData.isControllable);
        IERC20.ERC20Metadata memory erc20Metadata = IERC20.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });
        _tryInitialize_ERC20(securityAddress_, erc20Metadata);
        _tryInitialize_ERC1594(securityAddress_);
        ICap(securityAddress_).initialize_Cap(_securityData.maxSupply, new ICap.PartitionCap[](0));
        IProtectedPartitions(securityAddress_).initialize_ProtectedPartitions(_securityData.arePartitionsProtected);
        _tryInitializeClearing(securityAddress_, _securityData.clearingActive);
        IExternalPauseManagement(securityAddress_).initialize_ExternalPauses(_securityData.externalPauses);
        IExternalControlListManagement(securityAddress_).initialize_ExternalControlLists(
            _securityData.externalControlLists
        );
        IKyc(securityAddress_).initializeInternalKyc(_securityData.internalKycActivated);
        IExternalKycListManagement(securityAddress_).initialize_ExternalKycLists(_securityData.externalKycLists);
        _tryInitialize_ERC20Votes(securityAddress_, _securityData.erc20VotesActivated);
        IERC3643(securityAddress_).initialize_ERC3643(_securityData.compliance, _securityData.identityRegistry);
    }

    /**
     * @notice Attempts to initialise the ERC1410 multi-partition module on the deployed
     *         proxy; silently skips if the facet is absent.
     * @param securityAddress_   Address of the deployed security proxy.
     * @param isMultiPartition   True to enable multi-partition mode.
     */
    function _tryInitialize_ERC1410(address securityAddress_, bool isMultiPartition) private {
        try IERC1410(securityAddress_).initialize_ERC1410(isMultiPartition) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    /**
     * @notice Attempts to initialise the ERC1644 controller feature on the deployed
     *         proxy; silently skips if the facet is absent.
     * @param securityAddress_  Address of the deployed security proxy.
     * @param isControllable    True to enable controller operations at deployment.
     */
    function _tryInitialize_ERC1644(address securityAddress_, bool isControllable) private {
        try IERC1644(securityAddress_).initialize_ERC1644(isControllable) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    /**
     * @notice Attempts to initialise the ERC20 metadata module on the deployed proxy;
     *         silently skips if the facet is absent.
     * @param securityAddress_  Address of the deployed security proxy.
     * @param erc20Metadata     Memory struct containing token name, symbol, ISIN,
     *                          decimals, and security type classification.
     */
    function _tryInitialize_ERC20(address securityAddress_, IERC20.ERC20Metadata memory erc20Metadata) private {
        try IERC20(securityAddress_).initialize_ERC20(erc20Metadata) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    /**
     * @notice Attempts to initialise the ERC1594 issuance module on the deployed proxy;
     *         silently skips if the facet is absent.
     * @param securityAddress_  Address of the deployed security proxy.
     */
    function _tryInitialize_ERC1594(address securityAddress_) private {
        try IERC1594(securityAddress_).initialize_ERC1594() {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    /**
     * @notice Attempts to initialise the clearing module on the deployed proxy; silently
     *         skips if the facet is absent.
     * @param securityAddress_  Address of the deployed security proxy.
     * @param clearingActive    True to activate clearing operations at deployment.
     */
    function _tryInitializeClearing(address securityAddress_, bool clearingActive) private {
        try IClearingActions(securityAddress_).initializeClearing(clearingActive) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    /**
     * @notice Attempts to initialise the ERC20Votes governance module on the deployed
     *         proxy; silently skips if the facet is absent.
     * @param securityAddress_     Address of the deployed security proxy.
     * @param erc20VotesActivated  True to enable ERC20Votes delegation at deployment.
     */
    function _tryInitialize_ERC20Votes(address securityAddress_, bool erc20VotesActivated) private {
        try IERC20Votes(securityAddress_).initialize_ERC20Votes(erc20VotesActivated) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    /**
     * @notice Attempts to initialise the equity USA regulation module on the deployed
     *         proxy; silently skips if the facet is absent.
     * @param securityAddress_       Address of the deployed security proxy.
     * @param equityDetailsData      Equity-specific details including rights and
     *                               dividend type.
     * @param regulationData         Compiled regulation configuration for the deployment.
     * @param additionalSecurityData Additional security metadata for US regulation.
     */
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

    /**
     * @notice Attempts to initialise the bond USA regulation module on the deployed
     *         proxy; silently skips if the facet is absent.
     * @param securityAddress_       Address of the deployed security proxy.
     * @param bondDetailsData        Bond-specific details including dates and nominal
     *                               value.
     * @param regulationData         Compiled regulation configuration for the deployment.
     * @param additionalSecurityData Additional security metadata for US regulation.
     */
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

    /**
     * @notice Attempts to initialise the fixed interest rate module on the deployed
     *         proxy; silently skips if the facet is absent.
     * @param securityAddress_  Address of the deployed security proxy.
     * @param fixedRateData     Fixed rate configuration to initialise with.
     */
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

    /**
     * @notice Attempts to initialise the KPI-linked interest rate module on the deployed
     *         proxy; silently skips if the facet is absent.
     * @param securityAddress_  Address of the deployed security proxy.
     * @param interestRate      KPI interest rate configuration to initialise with.
     * @param impactData        KPI impact data configuration to initialise with.
     */
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

    /**
     * @notice Attempts to initialise the sustainability performance target rate module
     *         on the deployed proxy; re-reverts if the facet is present but fails.
     * @dev    Unlike other optional initialisers, a non-empty revert payload is treated
     *         as a genuine initialisation failure and is re-reverted via inline assembly.
     *         An empty revert payload (indicating an absent facet) is silently ignored.
     *         Callers must ensure the provided parameters satisfy all validation
     *         requirements of the SPT rate facet to avoid a mid-deployment revert.
     * @param securityAddress_  Address of the deployed security proxy.
     * @param interestRate      SPT interest rate configuration.
     * @param impactData        Array of SPT impact data configurations.
     * @param projects          Array of project addresses associated with the SPT rate.
     */
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

    /**
     * @notice Attempts to initialise the proceed recipients module on the deployed
     *         proxy; silently skips if the facet is absent.
     * @param securityAddress_    Address of the deployed security proxy.
     * @param proceedRecipients   Array of recipient addresses to register.
     * @param data                Array of ABI-encoded initialisation payloads
     *                            corresponding to each recipient.
     */
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

    /**
     * @notice Attempts to initialise the nominal value module on the deployed proxy;
     *         silently skips if the facet is absent.
     * @param securityAddress_      Address of the deployed security proxy.
     * @param nominalValue          Nominal value to initialise with.
     * @param nominalValueDecimals  Decimal precision of the nominal value.
     */
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

    /**
     * @notice Emits `IFactory.BondKpiLinkedRateDeployed` for a KPI-linked rate bond
     *         deployment.
     * @dev    Extracted into a separate private function to reduce stack depth in
     *         `deployBondKpiLinkedRate`. Must only be called after the deployment is
     *         fully complete.
     *         Emits: `IFactory.BondKpiLinkedRateDeployed`.
     * @param _bondAddress            Address of the deployed KPI-linked rate bond proxy.
     * @param _bondKpiLinkedRateData  Full calldata struct used for the deployment.
     */
    function _emitBondKpiLinkedRateDeployed(
        address _bondAddress,
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) private {
        emit BondKpiLinkedRateDeployed(EvmAccessors.getMsgSender(), _bondAddress, _bondKpiLinkedRateData);
    }

    /**
     * @notice Validates that bond start and maturity dates are well-ordered and that the
     *         maturity timestamp passes scheduled tasks validation.
     * @dev    Delegates ordering validation to `DatesValidation.checkDates` and
     *         maturity timestamp validation to
     *         `ScheduledTasksStorageWrapper.requireValidTimestamp`. Both calls may revert
     *         with their respective errors.
     * @param startingDate  Unix timestamp of the bond's intended start date.
     * @param maturityDate  Unix timestamp of the bond's maturity date; must be after
     *                      `startingDate` and must pass `requireValidTimestamp`.
     */
    function _checkBondDates(uint256 startingDate, uint256 maturityDate) private view {
        DatesValidation.checkDates(startingDate, maturityDate);
        ScheduledTasksStorageWrapper.requireValidTimestamp(maturityDate);
    }
}
