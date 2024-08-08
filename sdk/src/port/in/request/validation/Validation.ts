/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestAccount, RequestPublicKey } from '../BaseRequest.js';
import { EmptyValue } from '../error/EmptyValue.js';
import { InvalidLength } from '../error/InvalidLength.js';
import { InvalidRange } from '../error/InvalidRange.js';
import { InvalidFormatHedera as InvalidIdFormatHedera } from '../error/InvalidFormatHedera.js';
import { InvalidType } from '../error/InvalidType.js';
import BaseError from '../../../../core/error/BaseError.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import CheckStrings from '../../../../core/checks/strings/CheckStrings.js';
import CheckNums from '../../../../core/checks/numbers/CheckNums.js';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid.js';
import BigDecimal from '../../../../domain/context/shared/BigDecimal.js';
import Account from '../../../../domain/context/account/Account.js';
import ContractId from '../../../../domain/context/contract/ContractId.js';
import InvalidDecimalRange from '../../../../domain/context/security/error/InvalidDecimalRange.js';
import { SecurityRole } from '../../../../domain/context/security/SecurityRole.js';
import { InvalidRole } from '../../../../domain/context/security/error/InvalidRole.js';
import { EVM_ZERO_ADDRESS } from '../../../../core/Constants.js';
import { InvalidEvmAddress } from '../../../../domain/context/contract/error/InvalidEvmAddress.js';
import { InvalidFormatHederaIdOrEvmAddress } from '../error/InvalidFormatHederaIdOrEvmAddress.js';
import { InvalidBytes32 } from '../../../../domain/context/security/error/InvalidBytes32.js';
import { InvalidBytes3 } from '../../../../domain/context/bond/error/InvalidBytes3.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../domain/context/shared/HederaId.js';
import { InvalidBytes } from '../../../../domain/context/shared/error/InvalidBytes.js';

export default class Validation {
  public static checkPublicKey = () => {
    return (val: any): BaseError[] => {
      const key = val as RequestPublicKey;
      return PublicKey.validate(key);
    };
  };

  public static checkContractId = () => {
    return (val: any): BaseError[] => {
      return ContractId.validate(val as string);
    };
  };

  public static checkString = ({
    max = Number.MAX_VALUE,
    min = 0,
    emptyCheck = true,
  }) => {
    return (val: any): BaseError[] => {
      const err: BaseError[] = [];
      if (typeof val !== 'string') {
        err.push(new InvalidType(val));
      } else {
        if (emptyCheck && !CheckStrings.isNotEmpty(val)) {
          err.push(new EmptyValue(val));
        } else if (!CheckStrings.isLengthBetween(val, min, max)) {
          err.push(new InvalidLength(val, min, max));
        }
      }
      return err;
    };
  };

  public static checkNumber = <T extends string | number | bigint>({
    max,
    min,
  }: { max?: T; min?: T } = {}) => {
    return (val: any): BaseError[] => {
      const err: BaseError[] = [];
      const iMax = max || max === 0;
      const iMin = min || min === 0;
      const isBigDecimal: boolean = CheckNums.isBigDecimal(val);
      if (typeof val !== 'number' && !isBigDecimal) {
        err.push(new InvalidType(val));
      } else {
        let v = val;
        if (typeof v !== 'number') v = BigDecimal.fromString(v);
        if (iMin && !iMax) {
          if (CheckNums.isLessThan(v, min)) {
            err.push(new InvalidRange(v, min));
          }
        } else if (!iMin && iMax) {
          if (CheckNums.isGreaterThan(v, max)) {
            err.push(new InvalidRange(v, undefined, max));
          }
        } else if (iMin && iMax) {
          if (!CheckNums.isWithinRange(v, min, max)) {
            err.push(new InvalidRange(v, min, max));
          }
        }
      }
      return err;
    };
  };

  public static checkRole = () => {
    return (val: any): BaseError[] => {
      const err: BaseError[] = [];
      const roles: string[] = Object.values(SecurityRole);
      if (!roles.includes(val)) {
        err.push(new InvalidRole(val));
      }
      return err;
    };
  };

  public static checkAccount = () => {
    return (val: any): void => {
      const { accountId, publicKey, evmAddress } = val as RequestAccount;
      if (publicKey) {
        new Account({
          id: accountId,
          publicKey: new PublicKey(publicKey),
          evmAddress,
        });
      } else {
        new Account({
          id: accountId,
          evmAddress,
        });
      }
    };
  };

  public static checkHederaIdFormat = (zeroIsValid = false) => {
    return (val: any): BaseError[] => {
      // Account Id defined in hip-15 : https://hips.hedera.com/hip/hip-15
      const err: BaseError[] = [];
      if (!HEDERA_FORMAT_ID_REGEX.exec(val)) {
        err.push(new InvalidIdFormatHedera(val));
      } else if (!zeroIsValid && val === '0.0.0') {
        err.push(new AccountIdNotValid(val));
      }
      return err;
    };
  };

  public static checkEvmAddressFormat = (zeroIsValid = false) => {
    return (val: any): BaseError[] => {
      const evmAddressRegEx = /^0x[a-fA-F0-9]{40}$/;
      const err: BaseError[] = [];
      if (!evmAddressRegEx.exec(val)) {
        err.push(new InvalidEvmAddress(val));
      } else if (!zeroIsValid && val === EVM_ZERO_ADDRESS) {
        err.push(new AccountIdNotValid(val));
      }
      return err;
    };
  };

  public static checkHederaIdFormatOrEvmAddress = (zeroIsValid = false) => {
    return (val: any): BaseError[] => {
      // Account Id defined in hip-15 : https://hips.hedera.com/hip/hip-15
      const evmAddressRegEx = /^0x[a-fA-F0-9]{40}$/;
      const err: BaseError[] = [];
      if (!HEDERA_FORMAT_ID_REGEX.exec(val) && !evmAddressRegEx.exec(val)) {
        err.push(new InvalidFormatHederaIdOrEvmAddress(val));
      } else if (
        !zeroIsValid &&
        (val === '0.0.0' || val === EVM_ZERO_ADDRESS)
      ) {
        err.push(new AccountIdNotValid(val));
      }
      return err;
    };
  };

  public static checkAmount = (zeroIsValid = false, decimals = 18) => {
    return (val: any): BaseError[] => {
      const err: BaseError[] = [];
      const isBigDecimal: boolean = CheckNums.isBigDecimal(val);
      if (!isBigDecimal) {
        err.push(new InvalidType(val));
        return err;
      }
      const valueDecimals = BigDecimal.getDecimalsFromString(val);
      const zero = BigDecimal.fromString('0', valueDecimals);
      const value = BigDecimal.fromString(val);

      if (zeroIsValid && value.isLowerThan(zero))
        err.push(new InvalidRange(val, '0', undefined));
      else if (!zeroIsValid && value.isLowerOrEqualThan(zero))
        err.push(new InvalidRange(val, '0', undefined));

      if (valueDecimals > decimals) {
        err.push(new InvalidDecimalRange(val, 0, decimals));
      }
      return err;
    };
  };

  public static checkBytes32Format = () => {
    return (val: any): BaseError[] => {
      const bytes32RegEx = /^0x[a-fA-F0-9]{64}$/;
      const err: BaseError[] = [];
      if (!bytes32RegEx.exec(val)) {
        err.push(new InvalidBytes32(val));
      }
      return err;
    };
  };

  public static checkBytes3Format = () => {
    return (val: any): BaseError[] => {
      const bytes3RegEx = /^0x[a-fA-F0-9]{6}$/;
      const err: BaseError[] = [];
      if (!bytes3RegEx.exec(val)) {
        err.push(new InvalidBytes3(val));
      }
      return err;
    };
  };

  public static checkBytesFormat = () => {
    return (val: any): BaseError[] => {
      const bytesRegEx = /^0x([a-fA-F0-9][a-fA-F0-9])*$/;
      const err: BaseError[] = [];
      if (!bytesRegEx.exec(val)) {
        err.push(new InvalidBytes(val));
      }
      return err;
    };
  };
}
