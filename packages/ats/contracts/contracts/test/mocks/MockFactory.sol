// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Factory } from "../../factory/Factory.sol";
import { IFactory, FactoryRegulationData } from "../../factory/IFactory.sol";
import { ITimeTravel } from "../testTimeTravel/ITimeTravel.sol";
import { IInterestRate } from "../../facets/interestRate/IInterestRate.sol";
import { IInitializer } from "../../facets/initializer/IInitializer.sol";
import { IAccessControl } from "../../facets/accessControl/IAccessControl.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { FACTORY_OPERATIONAL_STATUS } from "../../constants/values.sol";
import { IKpis } from "../../facets/layer_2/kpi/kpiLatest/IKpis.sol";
import { IFixedRate } from "../../facets/layer_2/interestRate/fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";
import { IKpiLinkedRateErrors } from "../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateErrors.sol";
import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @title Mock Factory
 * @notice Test factory that deploys securities and initialises their time-travel support.
 * @dev Extends `Factory` for test environments where deployed securities expose `ITimeTravel`.
 *      The deployed security must implement `initializeTimeTravel`, otherwise deployment reverts.
 * @author Asset Tokenization Studio Team
 */
interface IMockFactory is IFactory, IKpiLinkedRateErrors {
    /**
     * @notice Full configuration for deploying a KPI-linked-rate bond.
     * @param bondData              Base bond configuration.
     * @param factoryRegulationData Regulatory classification applied at deployment.
     * @param interestRate          Initial KPI-linked interest-rate parameters.
     * @param impactData            KPI impact metrics used to compute the variable coupon.
     */
    struct BondKpiLinkedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IKpiLinkedRate.InterestRate interestRate;
        IKpiLinkedRate.ImpactData impactData;
    }

    /**
     * @notice Full configuration for deploying a fixed-rate bond.
     * @param bondData              Base bond configuration.
     * @param factoryRegulationData Regulatory classification applied at deployment.
     * @param fixedRateData         Fixed coupon rate and day-count convention parameters.
     */
    struct BondFixedRateData {
        BondData bondData;
        FactoryRegulationData factoryRegulationData;
        IFixedRate.FixedRateData fixedRateData;
    }

    /**
     * @notice Emitted when a new fixed-rate bond is deployed.
     * @param deployer Address that initiated the deployment.
     * @param bondAddress Address of the newly deployed bond proxy.
     * @param bondFixedRateData Full fixed-rate bond configuration.
     */
    event BondFixedRateDeployed(address indexed deployer, address bondAddress, BondFixedRateData bondFixedRateData);

    /**
     * @notice Emitted when a new KPI-linked-rate bond is deployed.
     * @param deployer Address that initiated the deployment.
     * @param bondAddress Address of the newly deployed bond proxy.
     * @param bondKpiLinkedRateData Full KPI-linked-rate bond configuration.
     */
    event BondKpiLinkedRateDeployed(
        address indexed deployer,
        address bondAddress,
        BondKpiLinkedRateData bondKpiLinkedRateData
    );

    /**
     * @notice Deploys and initialises a fixed-rate bond security proxy.
     * @dev Validates resolver, ISIN, admin RBAC, regulation data and bond dates. Initialises
     *      bond-specific and fixed-rate facets, marks the proxy operational, renounces this
     *      factory's temporary admin role and emits `BondFixedRateDeployed`.
     * @param _bondFixedRateData Fixed-rate bond deployment, regulation and rate data.
     * @return bondAddress_ Address of the deployed fixed-rate bond proxy.
     */
    function deployBondFixedRate(BondFixedRateData calldata _bondFixedRateData) external returns (address bondAddress_);

    /**
     * @notice Deploys and initialises a KPI-linked-rate bond security proxy.
     * @dev Validates resolver, ISIN, admin RBAC, regulation data, bond dates, interest-rate
     *      and impact data. Initialises bond-specific and KPI facets, marks the proxy
     *      operational, renounces this factory's temporary admin role and emits
     *      `BondKpiLinkedRateDeployed`.
     * @param _bondKpiLinkedRateData KPI-linked-rate bond deployment, regulation, rate and impact data.
     * @return bondAddress_ Address of the deployed KPI-linked-rate bond proxy.
     */
    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) external returns (address bondAddress_);
}

/**
 * @title Mock Factory Implementation
 * @author Asset Tokenization Studio Team
 */
abstract contract MockFactory is Factory, IMockFactory {
    /**
     * @notice Guarantees KPI-linked interest rate data is valid before deployment.
     * @dev Delegates to `_checkInterestRate`, which reverts for invalid interest-rate data.
     * @param _newInterestRate KPI-linked interest rate configuration to validate.
     */
    modifier onlyValidInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        _checkInterestRate(_newInterestRate);
        _;
    }

    /**
     * @notice Guarantees KPI impact data is valid before deployment.
     * @dev Delegates to `_checkImpactData`, which reverts for invalid impact data.
     * @param _newImpactData KPI impact configuration to validate.
     */
    modifier onlyValidImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        _checkImpactData(_newImpactData);
        _;
    }

    /**
     * @notice Deploys and initialises a fixed-rate bond security proxy.
     * @dev Validates resolver, ISIN, admin RBAC, regulation data and bond dates. Initialises
     *      bond-specific and fixed-rate facets, marks the proxy operational, renounces this
     *      factory's temporary admin role and emits `BondFixedRateDeployed`.
     * @param _bondFixedRateData Fixed-rate bond deployment, regulation and rate data.
     * @return bondAddress_ Address of the deployed fixed-rate bond proxy.
     */
    function deployBondFixedRate(
        BondFixedRateData calldata _bondFixedRateData
    )
        external
        onlyValidResolver(_bondFixedRateData.bondData.security.resolver)
        onlyValidISIN(_bondFixedRateData.bondData.security.erc20MetadataInfo.isin)
        onlyValidAdmins(_bondFixedRateData.bondData.security.rbacs)
        onlyValidRegulation(
            _bondFixedRateData.factoryRegulationData.regulationType,
            _bondFixedRateData.factoryRegulationData.regulationSubType
        )
        onlyValidBondDates(
            _bondFixedRateData.bondData.bondDetails.startingDate,
            _bondFixedRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBond(_bondFixedRateData.bondData, SecurityType.BondFixedRate);
        IFixedRate(bondAddress_).initializeFixedRate(_bondFixedRateData.fixedRateData);
        IInterestRate(bondAddress_).initializeInterestRateType(IInterestRate.RateType.FIXED);
        (bool isOperational_, ) = IInitializer(bondAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        emit BondFixedRateDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondFixedRateData);
    }

    /**
     * @notice Deploys and initialises a KPI-linked-rate bond security proxy.
     * @dev Validates resolver, ISIN, admin RBAC, regulation data, KPI rate data, impact data
     *      and bond dates. Initialises bond-specific and KPI-linked facets, marks the proxy
     *      operational, renounces this factory's temporary admin role and emits
     *      `BondKpiLinkedRateDeployed`.
     * @param _bondKpiLinkedRateData KPI-linked bond deployment, regulation and rate data.
     * @return bondAddress_ Address of the deployed KPI-linked-rate bond proxy.
     */
    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    )
        external
        onlyValidResolver(_bondKpiLinkedRateData.bondData.security.resolver)
        onlyValidISIN(_bondKpiLinkedRateData.bondData.security.erc20MetadataInfo.isin)
        onlyValidAdmins(_bondKpiLinkedRateData.bondData.security.rbacs)
        onlyValidRegulation(
            _bondKpiLinkedRateData.factoryRegulationData.regulationType,
            _bondKpiLinkedRateData.factoryRegulationData.regulationSubType
        )
        onlyValidInterestRate(_bondKpiLinkedRateData.interestRate)
        onlyValidImpactData(_bondKpiLinkedRateData.impactData)
        onlyValidBondDates(
            _bondKpiLinkedRateData.bondData.bondDetails.startingDate,
            _bondKpiLinkedRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBondKpiLinkedRate(_bondKpiLinkedRateData);
        (bool isOperational_, ) = IInitializer(bondAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        _emitBondKpiLinkedRateDeployed(bondAddress_, _bondKpiLinkedRateData);
    }

    /// @inheritdoc Factory
    /// @notice Deploys a security proxy and initialises time-travel state.
    /// @dev Initialises time-travel state on the deployed security after the base deployment.
    /// @param _securityData Core security configuration shared across all security types.
    /// @param _securityType Distinguishes the security variant being deployed.
    /// @return securityAddress_ Address of the deployed security proxy.
    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal override returns (address securityAddress_) {
        securityAddress_ = super._deploySecurity(_securityData, _securityType);
        ITimeTravel(securityAddress_).initializeTimeTravel();
    }

    /// @inheritdoc Factory
    /// @notice Deploys a deposit token proxy and initialises time-travel state.
    /// @dev Initialises time-travel state on the deployed deposit token after the base deployment.
    /// @param _securityData Core security configuration shared across all security types.
    /// @param _securityType Distinguishes the security variant being deployed.
    /// @return securityAddress_ Address of the deployed deposit token proxy.
    function _deployDepositToken(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal override returns (address securityAddress_) {
        securityAddress_ = super._deployDepositToken(_securityData, _securityType);
        ITimeTravel(securityAddress_).initializeTimeTravel();
    }

    /**
     * @notice Deploys and initialises the KPI-linked-rate bond facet set.
     * @dev Builds on `_deployBond`, then initialises KPI-linked rate metadata, rate type and
     *      KPI tracking. Operational status and admin renouncement remain caller concerns.
     * @param _data KPI-linked bond deployment data.
     * @return bondAddress_ Address of the deployed KPI-linked-rate bond proxy.
     */
    function _deployBondKpiLinkedRate(BondKpiLinkedRateData calldata _data) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, SecurityType.BondKpiLinkedRate);
        IKpiLinkedRate(bondAddress_).initializeKpiLinkedRate(_data.interestRate, _data.impactData);
        IInterestRate(bondAddress_).initializeInterestRateType(IInterestRate.RateType.KPI_LINKED);
        IKpis(bondAddress_).initializeKpis();
    }

    /**
     * @notice Emits the KPI-linked-rate bond deployment event.
     * @dev Uses `EvmAccessors.getMsgSender()` so the emitted deployer follows the project's
     *      message-sender abstraction.
     * @param _bondAddress Address of the deployed KPI-linked-rate bond proxy.
     * @param _bondKpiLinkedRateData KPI-linked bond deployment data emitted for indexing.
     */
    function _emitBondKpiLinkedRateDeployed(
        address _bondAddress,
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) private {
        emit BondKpiLinkedRateDeployed(EvmAccessors.getMsgSender(), _bondAddress, _bondKpiLinkedRateData);
    }

    /**
     * @notice Asserts that KPI-linked interest rate data is valid.
     * @dev Forwards to `InterestRateStorageWrapper.requireValidInterestRate`, which reverts for
     *      invalid interest-rate data.
     * @param _newInterestRate KPI-linked interest rate configuration to validate.
     */
    function _checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) private pure {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
    }

    /**
     * @notice Asserts that KPI impact data is valid.
     * @dev Forwards to `InterestRateStorageWrapper.requireValidImpactData`, which reverts for
     *      invalid impact data.
     * @param _newImpactData KPI impact configuration to validate.
     */
    function _checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) private pure {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
    }
}
