// SPDX-License-Identifier: Apache-2.0

import { SupportedWallets } from "@domain/network/Wallet";
import { InitializationData, NetworkData } from "@port/out/TransactionAdapter";

export enum WalletEvents {
  walletInit = "walletInit",
  walletFound = "walletFound",
  walletPaired = "walletPaired",
  walletConnectionStatusChanged = "walletConnectionStatusChanged",
  walletAcknowledgeMessage = "walletAcknowledgeMessage",
  walletDisconnect = "walletDisconnect",
}

export enum ConnectionState {
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Paired = "Paired",
}

export interface WalletBaseEvent {
  wallet: SupportedWallets;
}

export interface WalletInitEvent extends WalletBaseEvent {
  initData: InitializationData;
}

export interface WalletFoundEvent extends WalletBaseEvent {
  name: string;
}
export interface WalletPairedEvent extends WalletBaseEvent {
  data: InitializationData;
  network: NetworkData;
}
export interface WalletConnectionStatusChangedEvent extends WalletBaseEvent {
  status: ConnectionState;
}

export interface WalletAcknowledgeMessageEvent extends WalletBaseEvent {
  result: boolean;
}

type WalletEvent = {
  walletInit: (data: WalletInitEvent) => void;
  walletFound: (data: WalletFoundEvent) => void;
  walletPaired: (data: WalletPairedEvent) => void;
  walletConnectionStatusChanged: (data: WalletConnectionStatusChangedEvent) => void;
  walletAcknowledgeMessage: (data: WalletAcknowledgeMessageEvent) => void;
  walletDisconnect: (data: WalletBaseEvent) => void;
};

export default WalletEvent;
