// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import Account from "@domain/context/account/Account";
import PublicKey from "@domain/context/account/PublicKey";
import { RequestAccount } from "../BaseRequest";
import {
  AWSKMSConfigRequest,
  DFNSConfigRequest,
  FireblocksConfigRequest,
  HWCRequestSettings,
} from "../network/ConnectRequest";
import HWCSettings from "@core/settings/walletConnect/HWCSettings";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";
import FireblocksSettings from "@core/settings/custodialWalletSettings/FireblocksSettings";
import AWSKMSSettings from "@core/settings/custodialWalletSettings/AWSKMSSettings";

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

  public static hwcRequestToHWCSettings(req: HWCRequestSettings): HWCSettings {
    return new HWCSettings(req.projectId, req.dappName, req.dappDescription, req.dappURL, req.dappIcons);
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

  public static fireblocksRequestToFireblocksSettings(req: FireblocksConfigRequest): FireblocksSettings {
    return new FireblocksSettings(
      req.apiKey,
      req.apiSecretKey,
      req.baseUrl,
      req.assetId,
      req.vaultAccountId,
      req.hederaAccountId,
    );
  }

  public static awsKmsRequestToAwsKmsSettings(req: AWSKMSConfigRequest): AWSKMSSettings {
    return new AWSKMSSettings(
      req.awsAccessKeyId,
      req.awsSecretAccessKey,
      req.awsRegion,
      req.awsKmsKeyId,
      req.hederaAccountId,
    );
  }
}
