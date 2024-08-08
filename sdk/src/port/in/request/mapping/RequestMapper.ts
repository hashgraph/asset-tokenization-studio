/* eslint-disable @typescript-eslint/no-explicit-any */
// import LogService from '../../../../app/service/LogService.js';
import { isConstructible } from '../../../../core/Cast.js';
import { Constructible, MapFunction } from '../../../../core/Type.js';
import Account from '../../../../domain/context/account/Account.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import { RequestAccount, RequestPublicKey } from '../BaseRequest.js';
import ValidatedRequest from '../validation/ValidatedRequest.js';

export default class RequestMapper {
  public static isPublicKey = (val: any): val is RequestPublicKey => {
    if (val === undefined || !val) {
      return false;
    }
    const keys = Object.getOwnPropertyNames(val);
    return keys.includes('key') && keys.includes('type');
  };

  public static isAccount = (val: any): val is RequestAccount => {
    if (val === undefined || !val) {
      return false;
    }
    const keys = Object.getOwnPropertyNames(val);
    return keys.includes('accountId');
  };

  public static isRole = (val: any): val is string => {
    if (val === undefined || !val) {
      return false;
    }
    const keys = Object.getOwnPropertyNames({});
    return keys.includes(val);
  };

  public static getPublicKey(req?: RequestPublicKey): PublicKey | undefined {
    if (req) {
      return new PublicKey(req);
    } else return undefined;
  }

  public static getAccountId(id?: string): string | undefined {
    if (id) {
      return String(id);
    } else return undefined;
  }

  /**
   *
   * @param req ValidatedRequest<T> --> The request to map from
   * @param extra { [key in keyof ValidatedRequest<T>]: any } --> Extra parameter type mappings
   * @example
   * @returns The constructed mapped request
   */
  public static map<
    T extends ValidatedRequest<T>,
    K extends { [key in keyof T]: any },
  >(
    req: T,
    extra?: Partial<{
      [p in keyof K]: Constructible | MapFunction<any, any, T>;
    }>,
  ): K {
    // LogService.logTrace('Mapping: ', req);
    const entries = Object.entries(req);
    const extraKeys = this.renamePrivateProps(Object.keys(extra ?? {}));
    const target: { [n: string]: any } = {};
    entries.forEach(([key, val]) => {
      key = this.renamePrivateProps(key);
      if (
        extra &&
        extraKeys.includes(key) &&
        val !== undefined &&
        val !== null
      ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cll = extra[key as keyof K];
        if (isConstructible(cll)) {
          target[key] = new cll(val);
        } else if (cll) {
          target[key] = cll(val, req);
        }
      } else if (this.isPublicKey(val)) {
        target[key] = this.getPublicKey(val);
      } else {
        target[key] = val;
      }
    });
    // LogService.logTrace('To: ', target);
    return target as K;
  }

  public static renamePrivateProps(keys: string[]): string[];
  public static renamePrivateProps(keys: string): string;
  public static renamePrivateProps(keys: string | string[]): any {
    if (typeof keys === 'string') {
      return keys.startsWith('_') || keys.startsWith('#')
        ? keys.substring(1)
        : keys;
    } else {
      return keys.map((key) =>
        key.startsWith('_') || key.startsWith('#') ? key.substring(1) : key,
      );
    }
  }

  public static findPrivateProps(keys: string[]): string[];
  public static findPrivateProps(keys: string): string;
  public static findPrivateProps(keys: string | string[]): any {
    if (typeof keys === 'string') {
      return keys.startsWith('_') || keys.startsWith('#') ? keys : undefined;
    } else {
      return keys.filter((key) => key.startsWith('_') || key.startsWith('#'));
    }
  }

  public static mapAccount(account?: RequestAccount): Account | undefined {
    return account
      ? new Account({
          id: account.accountId,
          evmAddress: account.evmAddress,
          publicKey:
            account.publicKey?.key && account.publicKey.type
              ? new PublicKey({
                  key: account.publicKey?.key ?? '',
                  type: account.publicKey?.type ?? '',
                })
              : undefined,
        })
      : undefined;
  }
}
