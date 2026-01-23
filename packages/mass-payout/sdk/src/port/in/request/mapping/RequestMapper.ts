// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import Account from "@domain/account/Account";
import PublicKey from "@domain/account/PublicKey";
import { RequestAccount } from "../BaseRequest";
import { DFNSConfigRequest } from "../network/ConnectRequest";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";

export default class RequestMapper {
  public static mapAccount(account?: RequestAccount): Account | undefined {
    return account
      ? new Account({
          id: account.accountId,
          evmAddress: account.evmAddress,
          publicKey:
            account.publicKey?.key && account.publicKey.type
              ? new PublicKey({
                  key: account.publicKey?.key ?? "",
                  type: account.publicKey?.type ?? "",
                })
              : undefined,
        })
      : undefined;
  }

  public static dfnsRequestToDfnsSettings(req: DFNSConfigRequest): DfnsSettings {
    return new DfnsSettings(
      req.serviceAccountPrivateKey,
      req.credentialId,
      req.authorizationToken,
      req.urlApplicationOrigin,
      req.applicationId,
      req.baseUrl,
      req.walletId,
      req.hederaAccountId,
      req.publicKey,
    );
  }
}
