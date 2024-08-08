/* eslint-disable @typescript-eslint/no-explicit-any */

import LogService from '../../app/service/LogService.js';
import Account from '../../domain/context/account/Account.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import BaseEntity from '../../domain/context/BaseEntity.js';
import { isConstructible } from '../Cast.js';
import { Constructible, MapFunction } from '../Type.js';

export default class Mapper {
  public static isPublicKey = (val: any): val is PublicKey => {
    if (val === undefined || !val) {
      return false;
    }
    return val instanceof PublicKey;
  };

  public static isAccount = (val: any): val is Account => {
    if (val === undefined || !val) {
      return false;
    }
    return val instanceof Account;
  };

  /**
   *
   * @param req ValidatedRequest<T> --> The request to map from
   * @param extra { [key in keyof ValidatedRequest<T>]: any } --> Extra parameter type mappings
   * @example
   * @returns The constructed mapped request
   */
  public static mapToView<T extends BaseEntity, K>(
    req: T,
    extra?: Partial<{
      [p in keyof K]: Constructible | MapFunction<any, any, T>;
    }>,
  ): K {
    LogService.logTrace('Mapping: ', req);
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
      } else {
        target[key] = val;
      }
    });
    LogService.logTrace('To: ', target);
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
}
