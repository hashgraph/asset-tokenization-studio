# ATS Contratos - Lógica de Negocio a Bajo Nivel

## Arquitectura General: Storage Layout Aislado

### Patrón Diamond Storage

Cada feature utiliza **Diamond Storage Pattern** con posiciones fijas en storage:

```solidity
// contracts/layer_0/constants/storagePositions.sol
bytes32 constant _HOLD_STORAGE_POSITION = keccak256("storage.position.hold");
bytes32 constant _BOND_STORAGE_POSITION = keccak256("storage.position.bond");
bytes32 constant _EQUITY_STORAGE_POSITION = keccak256("storage.position.equity");
```

**Ventaja**: Evita colisiones de storage en upgrades - cada facet tiene su propio slot.

## Layer 0 - Storage Wrappers: Estructuras de Datos

### Ejemplo: HoldStorageWrapper1.sol

```solidity
struct HoldDataStorage {
  // Monto total retenido por cuenta
  mapping(address => uint256) totalHeldAmountByAccount;
  // Monto retenido por cuenta y partición
  mapping(address => mapping(bytes32 => uint256)) totalHeldAmountByAccountAndPartition;
  // Hold completo: cuenta → partition → holdId → datos
  mapping(address => mapping(bytes32 => mapping(uint256 => HoldData))) holdsByAccountPartitionAndId;
  // IDs de holds por cuenta y partición (enumerable)
  mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) holdIdsByAccountAndPartition;
  // Siguiente ID disponible
  mapping(address => mapping(bytes32 => uint256)) nextHoldIdByAccountAndPartition;
  // Third party que creó el hold
  mapping(address => mapping(bytes32 => mapping(uint256 => address))) holdThirdPartyByAccountPartitionAndId;
}

struct Hold {
  uint256 amount; // Cantidad retenida
  uint256 expirationTimestamp; // Fecha de expiración
  address escrow; // Dirección del escrow
  address to; // Destinatario final
  bytes data; // Datos adicionales
}

struct HoldData {
  uint256 id; // ID único del hold
  Hold hold; // Datos del hold
  bytes operatorData; // Datos del operador
  ThirdPartyType thirdPartyType; // OPERATOR | CONTROLLER | PROTECTED
}

enum ThirdPartyType {
  OPERATOR, // Creado por operador autorizado
  CONTROLLER, // Creado por controller (bypass compliance)
  PROTECTED // Creado con firma criptográfica
}
```

**Funciones internas de acceso**:

```solidity
function _getHold(HoldIdentifier memory _holdIdentifier) internal view returns (HoldData memory) {
  return
    _holdStorage().holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
      _holdIdentifier.holdId
    ];
}

function _holdStorage() internal pure returns (HoldDataStorage storage hold_) {
  bytes32 position = _HOLD_STORAGE_POSITION;
  assembly {
    hold_.slot := position
  }
}
```

### BondStorageWrapper.sol

```solidity
struct BondDataStorage {
  IBondRead.BondDetailsData bondDetail;
  bool initialized;
}

struct BondDetailsData {
  string isin; // Código ISIN del bono
  uint256 issuanceDate; // Fecha de emisión
  uint256 startingDate; // Fecha de inicio
  uint256 maturityDate; // Fecha de vencimiento
  uint256 nominalValue; // Valor nominal
  uint8 decimals; // Decimales
  string currency; // Moneda
}

struct Coupon {
  uint256 recordDate; // Fecha de registro (snapshot)
  uint256 executionDate; // Fecha de pago
  uint256 rate; // Tasa de interés
  uint8 rateDecimals; // Decimales de la tasa
  uint8 period; // Período (mensual, trimestral, etc.)
}
```

**Lógica de cupones**:

```solidity
function _setCoupon(
  Coupon memory _newCoupon
) internal returns (bool success_, bytes32 corporateActionId_, uint256 couponID_) {
  // 1. Registrar como acción corporativa
  bytes memory data = abi.encode(_newCoupon);
  (success_, corporateActionId_, couponID_) = _addCorporateAction(COUPON_CORPORATE_ACTION_TYPE, data);

  // 2. Programar snapshot automático en recordDate
  _addScheduledCrossOrderedTask(_newCoupon.recordDate, abi.encode(SNAPSHOT_TASK_TYPE));

  // 3. Asociar snapshot con el cupón
  _addScheduledSnapshot(_newCoupon.recordDate, abi.encode(corporateActionId_));
}
```

## Layer 1 - Lógica Core: Implementaciones Base

### 1. Common.sol - Base Compartida

```solidity
abstract contract Common is TransferAndLockStorageWrapper {
  // Modificadores de seguridad
  modifier onlyUnProtectedPartitionsOrWildCardRole() {
    if (_arePartitionsProtected() && !_hasRole(_WILD_CARD_ROLE, _msgSender())) {
      revert PartitionsAreProtectedAndNoRole(_msgSender(), _WILD_CARD_ROLE);
    }
    _;
  }

  modifier onlyDelegate() {
    if (_msgSender() != address(this)) revert OnlyDelegateAllowed();
    _;
  }

  modifier onlyClearingDisabled() {
    if (_isClearingActivated()) revert IClearing.ClearingIsActivated();
    _;
  }
}
```

### 2. AccessControl.sol - Sistema de Roles

```solidity
// Roles definidos como constantes keccak256
bytes32 constant _DEFAULT_ADMIN_ROLE = 0x00;
bytes32 constant _CONTROLLER_ROLE = keccak256("security.token.standard.role.controller");
bytes32 constant _ISSUER_ROLE = keccak256("security.token.standard.role.issuer");
bytes32 constant _AGENT_ROLE = keccak256("security.token.standard.role.agent");
bytes32 constant _CORPORATE_ACTION_ROLE = keccak256("security.token.standard.role.corporateAction");
bytes32 constant _FREEZE_MANAGER_ROLE = keccak256("security.token.standard.role.freezeManager");
bytes32 constant _KYC_ROLE = keccak256("security.token.standard.role.kyc");
bytes32 constant _MATURITY_REDEEMER_ROLE = keccak256("security.token.standard.role.maturityRedeemer");
bytes32 constant _PROCEED_RECIPIENT_MANAGER_ROLE = keccak256("...");
bytes32 constant _WILD_CARD_ROLE = keccak256("security.token.standard.role.wildcard");
```

**Lógica de grant/revoke**:

```solidity
function grantRole(
  bytes32 _role,
  address _account
)
  external
  onlyRole(_getRoleAdmin(_role)) // Solo el admin del rol puede otorgar
  onlyUnpaused
  returns (bool success_)
{
  if (!_grantRole(_role, _account)) {
    revert AccountAssignedToRole(_role, _account);
  }
  emit RoleGranted(_msgSender(), _account, _role);
  return true;
}
```

### 3. Freeze.sol - Congelamiento de Tokens

```solidity
abstract contract Freeze is IFreeze, Common {
  // Congelar cuenta completa
  function setAddressFrozen(
    address _userAddress,
    bool _freezStatus
  ) external onlyUnpaused validateAddress(_userAddress) {
    // Solo FREEZE_MANAGER_ROLE o AGENT_ROLE pueden congelar
    bytes32[] memory roles = new bytes32[](2);
    roles[0] = _FREEZE_MANAGER_ROLE;
    roles[1] = _AGENT_ROLE;
    _checkAnyRole(roles, _msgSender());

    _setAddressFrozen(_userAddress, _freezStatus);
    emit AddressFrozen(_userAddress, _freezStatus, _msgSender());
  }

  // Congelar cantidad parcial
  function freezePartialTokens(
    address _userAddress,
    uint256 _amount
  )
    external
    onlyUnpaused
    onlyUnrecoveredAddress(_userAddress) // No puede ser cuenta recuperada
    validateAddress(_userAddress)
    onlyWithoutMultiPartition
  {
    // Solo partición default

    bytes32[] memory roles = new bytes32[](2);
    roles[0] = _FREEZE_MANAGER_ROLE;
    roles[1] = _AGENT_ROLE;
    _checkAnyRole(roles, _msgSender());

    _freezeTokens(_userAddress, _amount);
    emit TokensFrozen(_userAddress, _amount, _DEFAULT_PARTITION);
  }
}
```

**Implicaciones en transfers**:

- Tokens congelados NO pueden transferirse
- `balanceOf(user) - getFrozenTokens(user) = transferible`

### 4. HoldManagement.sol - Gestión de Retenciones

```solidity
// 3 tipos de holds según creador:

// 1. OPERATOR HOLD - Creado por operador autorizado
function operatorCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  Hold calldata _hold,
  bytes calldata _operatorData
)
  external
  onlyUnpaused
  onlyClearingDisabled // Clearing debe estar desactivado
  onlyDefaultPartitionWithSinglePartition(_partition)
  onlyOperator(_partition, _from) // msg.sender debe ser operator de _from
  onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
  onlyUnProtectedPartitionsOrWildCardRole
  returns (bool success_, uint256 holdId_)
{
  // Validar que las direcciones no sean recovered accounts
  _checkRecoveredAddress(_msgSender());
  _checkRecoveredAddress(_hold.to);
  _checkRecoveredAddress(_from);

  (success_, holdId_) = _createHoldByPartition(_partition, _from, _hold, _operatorData, ThirdPartyType.OPERATOR);

  emit OperatorHeldByPartition(_msgSender(), _from, _partition, holdId_, _hold, _operatorData);
}

// 2. CONTROLLER HOLD - Bypass compliance
function controllerCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  Hold calldata _hold,
  bytes calldata _operatorData
)
  external
  onlyUnpaused
  onlyRole(_CONTROLLER_ROLE) // Solo CONTROLLER_ROLE
  onlyWithValidExpirationTimestamp(_hold.expirationTimestamp)
  onlyControllable // Token debe ser controlable
  returns (bool success_, uint256 holdId_)
{
  (success_, holdId_) = _createHoldByPartition(_partition, _from, _hold, _operatorData, ThirdPartyType.CONTROLLER);

  emit ControllerHeldByPartition(_msgSender(), _from, _partition, holdId_, _hold, _operatorData);
}

// 3. PROTECTED HOLD - Con firma criptográfica (EIP-712)
function protectedCreateHoldByPartition(
  bytes32 _partition,
  address _from,
  ProtectedHold memory _protectedHold,
  bytes calldata _signature
)
  external
  onlyUnpaused
  onlyClearingDisabled
  onlyUnrecoveredAddress(_from)
  onlyUnrecoveredAddress(_protectedHold.hold.to)
  onlyRole(_protectedPartitionsRole(_partition)) // Rol específico de la partición
  onlyWithValidExpirationTimestamp(_protectedHold.hold.expirationTimestamp)
  onlyProtectedPartitions
  returns (bool success_, uint256 holdId_)
{
  // Internamente valida la firma EIP-712
  (success_, holdId_) = _protectedCreateHoldByPartition(_partition, _from, _protectedHold, _signature);

  emit ProtectedHeldByPartition(_msgSender(), _from, _partition, holdId_, _protectedHold.hold, "");
}
```

**Flujo de Hold**:

```
1. CREATE → Hold creado, tokens bloqueados
2. EXECUTE → Tokens transferidos al destinatario (hold.to)
3. RELEASE → Tokens devueltos al holder original
4. RECLAIM → Escrow reclama tokens expirados
```

### 5. KYC (Know Your Customer)

```solidity
enum KycStatus {
  NOT_GRANTED, // Sin KYC
  GRANTED, // KYC aprobado
  REVOKED // KYC revocado
}

struct KycData {
  string vcId; // Verifiable Credential ID
  uint256 validFrom; // Fecha de inicio
  uint256 validTo; // Fecha de expiración
  address issuer; // Emisor del KYC
  KycStatus status; // Estado actual
}

function grantKyc(
  address _account,
  string memory _vcId,
  uint256 _validFrom,
  uint256 _validTo,
  address _issuer
)
  external
  onlyRole(_KYC_ROLE)
  onlyUnpaused
  validateAddress(_account)
  onlyValidKycStatus(KycStatus.NOT_GRANTED, _account) // Debe NO tener KYC
  onlyValidDates(_validFrom, _validTo)
  onlyIssuerListed(_issuer) // Issuer debe estar whitelisted
  returns (bool success_)
{
  success_ = _grantKyc(_account, _vcId, _validFrom, _validTo, _issuer);
  emit KycGranted(_account, _msgSender());
}
```

**Validación en Transfers**:

```solidity
modifier onlyValidKycStatus(KycStatus expectedStatus, address _account) {
    KycStatus status = _getKycStatusFor(_account);
    if (status != expectedStatus) {
        revert InvalidKycStatus(_account, status);
    }
    _;
}
```

### 6. ERC3643Operations.sol - Operaciones Core

```solidity
// MINT - Solo ISSUER_ROLE o AGENT_ROLE
function mint(
  address _to,
  uint256 _amount
)
  external
  onlyUnpaused
  onlyWithoutMultiPartition
  onlyWithinMaxSupply(_amount) // No exceder cap
  onlyIdentified(address(0), _to) // _to debe tener identity
  onlyCompliant(address(0), _to, false) // Compliance check
  onlyIssuable
{
  // Token debe ser issuable

  bytes32[] memory roles = new bytes32[](2);
  roles[0] = _ISSUER_ROLE;
  roles[1] = _AGENT_ROLE;
  _checkAnyRole(roles, _msgSender());

  _issue(_to, _amount, "");
}

// BURN - Solo CONTROLLER_ROLE o AGENT_ROLE
function burn(address _userAddress, uint256 _amount) external onlyUnpaused onlyControllable onlyWithoutMultiPartition {
  bytes32[] memory roles = new bytes32[](2);
  roles[0] = _CONTROLLER_ROLE;
  roles[1] = _AGENT_ROLE;
  _checkAnyRole(roles, _msgSender());

  _controllerRedeem(_userAddress, _amount, "", "");
}

// FORCED TRANSFER - Bypass compliance (recovery)
function forcedTransfer(
  address _from,
  address _to,
  uint256 _amount
) external onlyWithoutMultiPartition onlyControllable onlyUnpaused returns (bool) {
  bytes32[] memory roles = new bytes32[](2);
  roles[0] = _CONTROLLER_ROLE;
  roles[1] = _AGENT_ROLE;
  _checkAnyRole(roles, _msgSender());

  _controllerTransfer(_from, _to, _amount, "", "");
  return true;
}
```

### 7. CorporateActions.sol - Base para Acciones Corporativas

```solidity
function addCorporateAction(
  bytes32 _actionType,
  bytes memory _data
)
  external
  onlyUnpaused
  onlyRole(_CORPORATE_ACTION_ROLE)
  returns (bool success_, bytes32 corporateActionId_, uint256 corporateActionIndexByType_)
{
  (success_, corporateActionId_, corporateActionIndexByType_) = _addCorporateAction(_actionType, _data);

  if (!success_) {
    revert DuplicatedCorporateAction(_actionType, _data);
  }

  emit CorporateActionAdded(_msgSender(), _actionType, corporateActionId_, corporateActionIndexByType_, _data);
}
```

**Storage de Corporate Actions**:

```solidity
struct CorporateActionStorage {
  // ID → acción
  mapping(bytes32 => CorporateActionData) actions;
  // Tipo → lista de IDs
  mapping(bytes32 => EnumerableSet.Bytes32Set) actionsByType;
  // Lista ordenada de IDs
  EnumerableSet.Bytes32Set actionIds;
  // ID → resultados (para snapshots, etc.)
  mapping(bytes32 => mapping(bytes32 => bytes)) results;
}
```

## Layer 2 - Features Específicos: Bonos y Acciones

### 1. Bond.sol - Lógica de Bonos

```solidity
abstract contract Bond is IBond, Common {
  // Redención al vencimiento
  function redeemAtMaturityByPartition(
    address _tokenHolder,
    bytes32 _partition,
    uint256 _amount
  )
    external
    onlyUnpaused
    validateAddress(_tokenHolder)
    onlyDefaultPartitionWithSinglePartition(_partition)
    onlyListedAllowed(_tokenHolder) // Holder debe estar en lista
    onlyRole(_MATURITY_REDEEMER_ROLE) // Solo redeemer autorizado
    onlyClearingDisabled
    onlyUnProtectedPartitionsOrWildCardRole
    onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
    onlyUnrecoveredAddress(_tokenHolder)
    onlyAfterCurrentMaturityDate(_blockTimestamp())
  {
    // Debe haber vencido

    // Burn tokens del holder
    _redeemByPartition(_partition, _tokenHolder, _msgSender(), _amount, "", "");
  }

  // Configurar cupón
  function setCoupon(
    Coupon calldata _newCoupon
  )
    external
    onlyUnpaused
    onlyRole(_CORPORATE_ACTION_ROLE)
    validateDates(_newCoupon.recordDate, _newCoupon.executionDate)
    onlyValidTimestamp(_newCoupon.recordDate)
    returns (bool success_, uint256 couponID_)
  {
    bytes32 corporateActionID;
    (success_, corporateActionID, couponID_) = _setCoupon(_newCoupon);

    emit CouponSet(
      corporateActionID,
      couponID_,
      _msgSender(),
      _newCoupon.recordDate,
      _newCoupon.executionDate,
      _newCoupon.rate,
      _newCoupon.rateDecimals,
      _newCoupon.period
    );
  }

  // Actualizar fecha de vencimiento
  function updateMaturityDate(
    uint256 _newMaturityDate
  )
    external
    onlyUnpaused
    onlyRole(_BOND_MANAGER_ROLE)
    onlyAfterCurrentMaturityDate(_newMaturityDate) // Debe ser mayor a la actual
    returns (bool success_)
  {
    emit MaturityDateUpdated(address(this), _newMaturityDate, _getMaturityDate());
    success_ = _setMaturityDate(_newMaturityDate);
    return success_;
  }
}
```

**Cálculo de cupón para un holder**:

```solidity
function _getCouponFor(uint256 _couponID, address _account) internal view returns (CouponFor memory couponFor_) {
  RegisteredCoupon memory registeredCoupon = _getCoupon(_couponID);

  couponFor_.rate = registeredCoupon.coupon.rate;
  couponFor_.rateDecimals = registeredCoupon.coupon.rateDecimals;
  couponFor_.recordDate = registeredCoupon.coupon.recordDate;
  couponFor_.executionDate = registeredCoupon.coupon.executionDate;
  couponFor_.period = registeredCoupon.coupon.period;

  // Si ya pasó la recordDate, calcular balance
  if (registeredCoupon.coupon.recordDate < _blockTimestamp()) {
    couponFor_.recordDateReached = true;

    // Balance en el snapshot (si existe) o balance actual
    couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
      ? _getTotalBalanceOfAtSnapshot(registeredCoupon.snapshotId, _account)
      : _getTotalBalance(_account);

    couponFor_.decimals = _decimalsAdjusted();
  }

  // Pago = (tokenBalance * rate) / 10^rateDecimals
}
```

### 2. Equity.sol - Lógica de Acciones

```solidity
abstract contract Equity is IEquity, Common {
  // Configurar dividendo
  function setDividends(
    Dividend calldata _newDividend
  )
    external
    onlyUnpaused
    onlyRole(_CORPORATE_ACTION_ROLE)
    validateDates(_newDividend.recordDate, _newDividend.executionDate)
    onlyValidTimestamp(_newDividend.recordDate)
    returns (bool success_, uint256 dividendID_)
  {
    bytes32 corporateActionID;
    (success_, corporateActionID, dividendID_) = _setDividends(_newDividend);

    emit DividendSet(
      corporateActionID,
      dividendID_,
      _msgSender(),
      _newDividend.recordDate,
      _newDividend.executionDate,
      _newDividend.amount
    );
  }

  // Configurar votación
  function setVoting(
    Voting calldata _newVoting
  )
    external
    onlyUnpaused
    onlyRole(_CORPORATE_ACTION_ROLE)
    onlyValidTimestamp(_newVoting.recordDate)
    returns (bool success_, uint256 voteID_)
  {
    bytes32 corporateActionID;
    (success_, corporateActionID, voteID_) = _setVoting(_newVoting);

    emit VotingSet(corporateActionID, voteID_, _msgSender(), _newVoting.recordDate, _newVoting.data);
  }

  // Stock split / reverse split
  function setScheduledBalanceAdjustment(
    ScheduledBalanceAdjustment calldata _newBalanceAdjustment
  )
    external
    onlyUnpaused
    onlyRole(_CORPORATE_ACTION_ROLE)
    onlyValidTimestamp(_newBalanceAdjustment.executionDate)
    validateFactor(_newBalanceAdjustment.factor) // Factor > 0
    returns (bool success_, uint256 balanceAdjustmentID_)
  {
    bytes32 corporateActionID;
    (success_, corporateActionID, balanceAdjustmentID_) = _setScheduledBalanceAdjustment(_newBalanceAdjustment);

    emit ScheduledBalanceAdjustmentSet(
      corporateActionID,
      balanceAdjustmentID_,
      _msgSender(),
      _newBalanceAdjustment.executionDate,
      _newBalanceAdjustment.factor,
      _newBalanceAdjustment.decimals
    );
  }
}
```

**Estructuras**:

```solidity
struct Dividend {
  uint256 recordDate; // Fecha del snapshot
  uint256 executionDate; // Fecha de pago
  uint256 amount; // Monto total a distribuir
}

struct Voting {
  uint256 recordDate; // Fecha del snapshot
  bytes data; // Datos de la votación
}

struct ScheduledBalanceAdjustment {
  uint256 executionDate; // Cuándo aplicar
  uint256 factor; // Factor de multiplicación
  uint8 decimals; // Decimales del factor
}

// Ejemplo: Stock split 2:1
// factor = 2, decimals = 0
// balance_nuevo = balance_viejo * 2

// Ejemplo: Reverse split 1:10
// factor = 1, decimals = 1 (= 0.1)
// balance_nuevo = balance_viejo * 0.1
```

### 3. ProceedRecipients.sol - Distribución de Pagos

```solidity
// Lista de direcciones que reciben pagos (dividendos, cupones)
function addProceedRecipient(
  address _proceedRecipient,
  bytes calldata _data
) external onlyUnpaused onlyRole(_PROCEED_RECIPIENT_MANAGER_ROLE) onlyIfNotProceedRecipient(_proceedRecipient) {
  _addProceedRecipient(_proceedRecipient, _data);
  emit ProceedRecipientAdded(_msgSender(), _proceedRecipient, _data);
}

// _data puede contener:
// - Porcentaje de distribución
// - Dirección del contrato de pago
// - Configuración de liquidación
```

### 4. ScheduledTasks - Tareas Programadas

**ScheduledSnapshots**:

```solidity
// Programar snapshot automático
function _addScheduledSnapshot(uint256 _executionDate, bytes memory _data) internal {
  bytes32 taskId = keccak256(abi.encodePacked(_executionDate, _data));

  ScheduledTask memory task = ScheduledTask({
    taskId: taskId,
    executionDate: _executionDate,
    data: _data,
    executed: false
  });

  _scheduledSnapshotsStorage().tasks[taskId] = task;
  _scheduledSnapshotsStorage().taskIds.add(taskId);
}
```

**ScheduledBalanceAdjustments**:

```solidity
// Ejecutar ajuste de balance programado (stock split)
function executeScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external {
  ScheduledBalanceAdjustment memory adjustment = _getScheduledBalanceAdjusment(_balanceAdjustmentID);

  // Verificar que llegó executionDate
  require(_blockTimestamp() >= adjustment.executionDate, "Too early");

  // Aplicar factor a todos los balances
  address[] memory holders = _getTokenHolders(0, type(uint256).max);

  for (uint256 i = 0; i < holders.length; i++) {
    uint256 currentBalance = _balanceOf(holders[i]);
    uint256 newBalance = (currentBalance * adjustment.factor) / (10 ** adjustment.decimals);

    _adjustBalance(holders[i], newBalance);
  }
}
```

**ScheduledCrossOrderedTasks**:

```solidity
// Tareas con dependencias entre sí
// Ejemplo: Snapshot debe ejecutarse ANTES de calcular dividendos

struct CrossOrderedTask {
  bytes32 taskId;
  uint256 executionDate;
  bytes32[] dependencies; // IDs de tareas que deben ejecutarse primero
  bytes data;
  bool executed;
}
```

## Resolver y Diamond Proxy

### BusinessLogicResolver.sol

```solidity
contract BusinessLogicResolver is IBusinessLogicResolver, DiamondCutManager {
  struct BusinessLogicRegistryData {
    bytes32 businessLogicKey; // Ejemplo: "BOND_V1", "EQUITY_V2"
    address implementation; // Dirección del facet
    bytes4[] selectors; // Function selectors que implementa
  }

  // Registrar nuevas versiones de facets
  function registerBusinessLogics(
    BusinessLogicRegistryData[] calldata _businessLogics
  ) external onlyValidKeys(_businessLogics) onlyRole(_DEFAULT_ADMIN_ROLE) onlyUnpaused {
    uint256 latestVersion = _registerBusinessLogics(_businessLogics);
    emit BusinessLogicsRegistered(_businessLogics, latestVersion);
  }

  // Resolver la dirección del facet más reciente
  function resolveLatestBusinessLogic(bytes32 _businessLogicKey) external view returns (address businessLogicAddress_) {
    businessLogicAddress_ = _resolveLatestBusinessLogic(_businessLogicKey);
  }

  // Resolver versión específica
  function resolveBusinessLogicByVersion(
    bytes32 _businessLogicKey,
    uint256 _version
  ) external view returns (address businessLogicAddress_) {
    businessLogicAddress_ = _resolveBusinessLogicByVersion(_businessLogicKey, _version);
  }
}
```

**Storage**:

```solidity
struct BusinessLogicResolverStorage {
  // Key → versión → dirección
  mapping(bytes32 => mapping(uint256 => address)) businessLogicsByKeyAndVersion;
  // Key → última versión
  mapping(bytes32 => uint256) latestVersionByKey;
  // Versión global más reciente
  uint256 latestVersion;
  // Lista de keys registradas
  EnumerableSet.Bytes32Set businessLogicKeys;
  bool initialized;
}
```

### Diamond Proxy - Delegación de Llamadas

```solidity
// El proxy intercepta todas las llamadas y delega al facet correcto
fallback() external payable {
  address facet = _resolveFacet(msg.sig); // Buscar facet por selector

  require(facet != address(0), "Function does not exist");

  // Delegatecall al facet
  assembly {
    calldatacopy(0, 0, calldatasize())
    let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
    returndatacopy(0, 0, returndatasize())

    switch result
    case 0 {
      revert(0, returndatasize())
    }
    default {
      return(0, returndatasize())
    }
  }
}

function _resolveFacet(bytes4 selector) internal view returns (address) {
  // 1. Buscar en mapping local del proxy
  address localFacet = _selectorToFacet[selector];
  if (localFacet != address(0)) return localFacet;

  // 2. Consultar al BusinessLogicResolver
  bytes32 blk = _selectorToBusinessLogicKey[selector];
  return _resolver.resolveLatestBusinessLogic(blk);
}
```

## Flujos de Negocio Completos

### Flujo 1: Creación y Pago de Cupón de Bono

```
1. CORPORATE_ACTION_ROLE llama a setCoupon():
   ├─ Crea CorporateAction con tipo COUPON_CORPORATE_ACTION_TYPE
   ├─ Programa ScheduledSnapshot en recordDate
   └─ Asocia snapshot con el cupón

2. Sistema ejecuta snapshot automáticamente en recordDate:
   ├─ Captura lista de holders y balances
   └─ Almacena snapshotId en el cupón

3. En executionDate, sistema externo (Mass Payout):
   ├─ Lee holders del snapshot: getCouponHolders(couponID)
   ├─ Para cada holder:
   │  ├─ balance = getTotalBalanceOfAtSnapshot(snapshotId, holder)
   │  ├─ pago = (balance * rate) / 10^rateDecimals
   │  └─ Transfiere pago al holder
   └─ Marca distribución como completada
```

### Flujo 2: Dividendo en Equity

```
1. CORPORATE_ACTION_ROLE llama a setDividends():
   ├─ Crea CorporateAction con tipo DIVIDEND_CORPORATE_ACTION_TYPE
   └─ Programa ScheduledSnapshot en recordDate

2. Sistema ejecuta snapshot en recordDate:
   ├─ Captura lista de holders y balances
   └─ Almacena snapshotId

3. En executionDate:
   ├─ totalSupplyAtSnapshot = suma de balances en snapshot
   ├─ Para cada holder:
   │  ├─ balance = getTotalBalanceOfAtSnapshot(snapshotId, holder)
   │  ├─ proporción = balance / totalSupplyAtSnapshot
   │  ├─ pago = dividendAmount * proporción
   │  └─ Transfiere pago
   └─ Distribuye a proceedRecipients si están configurados
```

### Flujo 3: Transfer con Compliance

```
1. Usuario llama a transfer(to, amount):
   ↓
2. Validaciones pre-transfer:
   ├─ onlyUnpaused: Token no pausado
   ├─ onlyValidKycStatus: from y to tienen KYC GRANTED
   ├─ onlyCompliant: Consulta compliance module
   │  ├─ Verifica límites de inversores
   │  ├─ Verifica restricciones por país
   │  └─ Verifica reglas específicas
   ├─ Balance suficiente: balanceOf(from) - frozenTokens >= amount
   ├─ No congelado: !isAddressFrozen(from)
   └─ Sin holds que bloqueen: balanceOf(from) - heldAmount >= amount
   ↓
3. Ejecución del transfer:
   ├─ _balances[from] -= amount
   ├─ _balances[to] += amount
   ├─ Actualizar lista de holders
   └─ emit Transfer(from, to, amount)
   ↓
4. Post-transfer hooks:
   └─ Notificar al compliance module (opcional)
```

### Flujo 4: Hold → Execute → Clearing

```
1. Operator crea hold:
   operatorCreateHoldByPartition(partition, from, hold, operatorData)
   ├─ Valida balance disponible
   ├─ Crea HoldData con id único
   ├─ totalHeldAmountByAccount[from] += hold.amount
   └─ emit OperatorHeldByPartition(...)

2. Tokens están bloqueados:
   balanceAvailable = balanceOf(from) - frozenTokens - heldAmount

3. Escrow ejecuta el hold:
   executeHoldByPartition(holdIdentifier, amount)
   ├─ Valida msg.sender == hold.escrow
   ├─ Valida hold no expirado
   ├─ Transfer de from → hold.to (amount)
   ├─ totalHeldAmountByAccount[from] -= amount
   ├─ Si hold completamente ejecutado, eliminar hold
   └─ emit ExecutedByPartition(...)

4. Alternativa - Release:
   releaseHoldByPartition(holdIdentifier, amount)
   ├─ Valida msg.sender == hold.escrow
   ├─ Libera tokens sin transferir
   └─ totalHeldAmountByAccount[from] -= amount
```

## Optimizaciones y Patrones Avanzados

### 1. Batch Operations

```solidity
function batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external {
  // Primero valida TODAS las addresses (fail fast)
  for (uint256 i = 0; i < _userAddresses.length; i++) {
    _checkRecoveredAddress(_userAddresses[i]);
  }

  // Luego ejecuta operaciones (evita gas wasted)
  for (uint256 i = 0; i < _userAddresses.length; i++) {
    _freezeTokens(_userAddresses[i], _amounts[i]);
    emit TokensFrozen(_userAddresses[i], _amounts[i], _DEFAULT_PARTITION);
  }
}
```

### 2. Paginación en Queries

```solidity
function getDividendHolders(
  uint256 _dividendID,
  uint256 _pageIndex,
  uint256 _pageLength
) external view returns (address[] memory holders_) {
  RegisteredDividend memory dividend = _getDividends(_dividendID);

  if (dividend.snapshotId != 0) {
    return _tokenHoldersAt(dividend.snapshotId, _pageIndex, _pageLength);
  }

  return _getTokenHolders(_pageIndex, _pageLength);
}
```

### 3. EnumerableSet para O(1) lookups

```solidity
// Permite iterar holders + búsquedas O(1)
EnumerableSet.AddressSet private _tokenHolders;

function _addHolder(address holder) internal {
    _tokenHolders.add(holder);  // O(1) y no duplica
}

function _removeHolder(address holder) internal {
    if (_balanceOf(holder) == 0) {
        _tokenHolders.remove(holder);
    }
}
```

## Resumen de Roles y Permisos

| Rol                              | Permisos                                              |
| -------------------------------- | ----------------------------------------------------- |
| `DEFAULT_ADMIN_ROLE`             | Admin supremo, gestiona otros roles                   |
| `ISSUER_ROLE`                    | Mint de tokens nuevos                                 |
| `CONTROLLER_ROLE`                | Forced transfers, burn, bypass compliance             |
| `AGENT_ROLE`                     | Mint, burn, freeze, forced transfer (multi-propósito) |
| `CORPORATE_ACTION_ROLE`          | Crear cupones, dividendos, votaciones                 |
| `FREEZE_MANAGER_ROLE`            | Congelar/descongelar cuentas y tokens                 |
| `KYC_ROLE`                       | Grant/revoke KYC                                      |
| `MATURITY_REDEEMER_ROLE`         | Redimir bonos al vencimiento                          |
| `BOND_MANAGER_ROLE`              | Actualizar maturity date                              |
| `PROCEED_RECIPIENT_MANAGER_ROLE` | Gestionar recipients de pagos                         |
| `WILD_CARD_ROLE`                 | Bypass restricciones de protected partitions          |
| `SNAPSHOT_ROLE`                  | Crear snapshots manuales                              |
| `PAUSER_ROLE`                    | Pausar/despausar el contrato                          |

## Conclusión

La arquitectura ATS utiliza **separación estricta de concerns en 4 capas**:

1. **Layer 0**: Pure data structures (storage layout)
2. **Layer 1**: Business logic reutilizable (ERC-1400/3643, roles, holds, freeze, KYC)
3. **Layer 2**: Producto-specific (Bond, Equity, scheduled tasks)
4. **Layer 3**: Jurisdicción-specific (USA, EU, etc.)

**Ventajas**:

- ✅ Upgradeability granular (facet por facet)
- ✅ Storage colisión-free (diamond storage)
- ✅ Reusabilidad máxima de lógica
- ✅ Compliance automatizada en cada operación
- ✅ Auditable (eventos completos)

---

## Referencias

- Ubicación de contratos: `packages/ats/contracts/contracts/`
- Tests: `packages/ats/contracts/test/`
- Deployment scripts: `packages/ats/contracts/scripts/`
- EIP-2535 Diamond Standard: https://eips.ethereum.org/EIPS/eip-2535
- ERC-1400 Security Token Standard: https://github.com/ethereum/EIPs/issues/1400
- ERC-3643 T-REX Standard: https://eips.ethereum.org/EIPS/eip-3643
