// SPDX-License-Identifier: Apache-2.0

import { HederaId } from "../shared/HederaId";
import PrivateKey from "./PrivateKey";
import PublicKey from "./PublicKey";

export interface AccountProps {
  id: string;
  privateKey?: PrivateKey;
  publicKey?: PublicKey;
  evmAddress?: string;
  alias?: string;
}

export default class Account {
  public static readonly NULL: Account = new Account({ id: "0.0.0" });
  public id: HederaId;
  public evmAddress?: string;
  public privateKey?: PrivateKey;
  public publicKey?: PublicKey;
  public alias?: string;
  constructor(props: AccountProps) {
    Object.assign(this, { ...props, id: HederaId.from(props.id) });
  }
}
