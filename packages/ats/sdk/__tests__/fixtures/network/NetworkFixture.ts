// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { ConnectCommand } from "@command/network/connect/ConnectCommand";
import { SupportedWallets } from "@domain/context/network/Wallet";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";
import FireblocksSettings from "@core/settings/custodialWalletSettings/FireblocksSettings";
import AWSKMSSettings from "@core/settings/custodialWalletSettings/AWSKMSSettings";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import HWCSettings from "@core/settings/walletConnect/HWCSettings";
import { SetConfigurationCommand } from "@command/network/setConfiguration/SetConfigurationCommand";
import { SetNetworkCommand } from "@command/network/setNetwork/SetNetworkCommand";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";

export const DfnsSettingsFixture = createFixture<DfnsSettings>((settings) => {
  (settings.serviceAccountSecretKey.faker((faker) => faker.string.uuid()),
    settings.serviceAccountCredentialId.faker((faker) => faker.string.uuid()),
    settings.serviceAccountAuthToken.faker((faker) => faker.string.uuid()),
    settings.appOrigin.faker((faker) => faker.internet.url()),
    settings.appId.faker((faker) => faker.string.uuid()),
    settings.baseUrl.faker((faker) => faker.internet.url()),
    settings.walletId.faker((faker) => faker.string.uuid()),
    settings.hederaAccountId.as(() => HederaIdPropsFixture.create().value),
    settings.publicKey.faker((faker) => faker.string.hexadecimal({ length: 40, casing: "lower", prefix: "0x" })));
});

export const FireblocksSettingsFixture = createFixture<FireblocksSettings>((settings) => {
  (settings.apiKey.faker((faker) => faker.string.uuid()),
    settings.apiSecretKey.faker((faker) => faker.string.alphanumeric(32)),
    settings.baseUrl.faker((faker) => faker.internet.url()),
    settings.assetId.faker((faker) => faker.string.alphanumeric(8)),
    settings.vaultAccountId.faker((faker) => faker.string.numeric(6)),
    settings.hederaAccountId.as(() => HederaIdPropsFixture.create().value));
});

export const AWSKMSSettingsFixture = createFixture<AWSKMSSettings>((settings) => {
  (settings.awsAccessKeyId.faker((faker) => faker.string.alphanumeric(20)),
    settings.awsSecretAccessKey.faker((faker) => faker.string.alphanumeric(40)),
    settings.awsRegion.faker((faker) => faker.helpers.arrayElement(["us-east-1", "us-west-2", "eu-west-1"])),
    settings.awsKmsKeyId.faker((faker) => faker.string.uuid()),
    settings.hederaAccountId.as(() => HederaIdPropsFixture.create().value));
});

export const HWCSettingsFixture = createFixture<HWCSettings>((settings) => {
  (settings.projectId.faker((faker) => faker.string.uuid()),
    settings.dappName.faker((faker) => faker.company.name()),
    settings.dappDescription.faker((faker) => faker.lorem.sentence()),
    settings.dappURL.faker((faker) => faker.internet.url()),
    settings.dappIcons.faker((faker) => [faker.image.url(), faker.image.url()]));
});

export const ConnectCommandFixture = createFixture<ConnectCommand>((command) => {
  (command.environment.faker((faker) => faker.helpers.arrayElement(["testnet", "previewnet", "mainnet", "local"])),
    command.wallet.faker((faker) => faker.helpers.arrayElement(Object.values(SupportedWallets))),
    command.HWCSettings?.as(() => HWCSettingsFixture.create()),
    command.custodialSettings?.faker((faker) =>
      faker.helpers.arrayElement([
        DfnsSettingsFixture.create(),
        FireblocksSettingsFixture.create(),
        AWSKMSSettingsFixture.create(),
      ]),
    ));
});

export const SetConfigurationCommandFixture = createFixture<SetConfigurationCommand>((command) => {
  (command.factoryAddress.as(() => HederaIdPropsFixture.create().value),
    command.resolverAddress.as(() => HederaIdPropsFixture.create().value));
});

export const MirrorNodeFixture = createFixture<MirrorNode>((node) => {
  (node.baseUrl.faker((faker) => faker.internet.url()),
    node.name?.faker((faker) => faker.company.name()),
    node.apiKey?.faker((faker) => faker.string.alphanumeric(32)),
    node.headerName?.faker((faker) => faker.string.alpha({ length: 10 })));
});

export const JsonRpcRelayFixture = createFixture<JsonRpcRelay>((relay) => {
  (relay.baseUrl.faker((faker) => faker.internet.url()),
    relay.name?.faker((faker) => faker.company.name()),
    relay.apiKey?.faker((faker) => faker.string.alphanumeric(32)),
    relay.headerName?.faker((faker) => faker.string.alpha({ length: 10 })));
});

export const SetNetworkCommandFixture = createFixture<SetNetworkCommand>((command) => {
  (command.environment.faker((faker) => faker.helpers.arrayElement(["testnet", "previewnet", "mainnet", "local"])),
    command.mirrorNode.as(() => MirrorNodeFixture.create()),
    command.rpcNode.as(() => JsonRpcRelayFixture.create()),
    command.consensusNodes?.faker((faker) => faker.internet.url()));
});
