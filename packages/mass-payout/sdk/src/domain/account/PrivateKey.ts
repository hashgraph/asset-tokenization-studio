// SPDX-License-Identifier: Apache-2.0

import KeyProps, { KeyType } from "./KeyProps";
import { PrivateKey as HPrivateKey } from "@hiero-ledger/sdk";
import PublicKey from "./PublicKey";

export default class PrivateKey implements KeyProps {
  public readonly key: string;
  public readonly type: string;
  public readonly publicKey: PublicKey;

  constructor(props: KeyProps) {
    const { key, type } = props;
    this.type = this.validateType(type);
    this.key = key;
    this.publicKey = PublicKey.fromHederaKey(this.toHashgraphKey().publicKey);
  }

  public toString(): string {
    return JSON.stringify({
      key: this.key,
      type: this.type,
    });
  }

  public validateType(type?: string): KeyType {
    if (type && Object.keys(KeyType).includes(type)) {
      return Object.entries(KeyType).filter(([key]) => key === type)[0][1];
    }
    return KeyType.NULL;
  }

  public toHashgraphKey(): HPrivateKey {
    return this.type === KeyType.ED25519
      ? HPrivateKey.fromStringED25519(this.key)
      : HPrivateKey.fromStringECDSA(this.key);
  }
}
