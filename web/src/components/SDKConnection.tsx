import { useEffect, useState } from "react";
import { useSDKInit } from "../hooks/queries/SDKConnection";
import type {
  EventParameter,
  InitializationData,
  NetworkData,
} from "@hashgraph/asset-tokenization-sdk";
import { useWalletStore } from "../store/walletStore";
import { WalletStatus } from "../utils/constants";
import { useToast } from "@hashgraph/asset-tokenization-uicomponents/Overlay/Toast";
import { useTranslation } from "react-i18next";
import _isEqual from "lodash/isEqual";
import { RouterManager } from "../router/RouterManager";

export const SDKConnection = () => {
  const { mutate: init } = useSDKInit();
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const {
    reset,
    setPairedWallet,
    data,
    network,
    connectionStatus,
    setConnectionStatus,
  } = useWalletStore();
  const toast = useToast();
  const { t } = useTranslation("globals");
  const [currentNetworkName, setCurrentNetworkName] = useState<string>("");

  useEffect(() => {
    const isConnected = window.ethereum?.isConnected();

    if (isConnected) {
      setIsMetamaskConnected(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window?.ethereum?.isConnected]);

  useEffect(() => {
    if (isMetamaskConnected) {
      init(walletEvents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMetamaskConnected]);

  useEffect(() => {
    if (data) {
      const currentWallet = data.account?.id.value.toString();

      if (currentWallet != "0.0.0") {
        toast.show({
          duration: 3000,
          title: t("walletChanged", {
            currentWallet,
          }),
          status: "success",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (network?.name) {
      if (network.name !== currentNetworkName) {
        const { name, recognized } = network;

        if (recognized) {
          toast.show({
            duration: 3000,
            title: t("networkChanged", {
              currentNetwork: name,
            }),
            status: "success",
          });
        }
      }

      setCurrentNetworkName(network.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const walletPaired = (event: EventParameter<"walletPaired">) => {
    console.log("SDK message --> Wallet paired", event);
    const { data, network } = event;

    showErrors(data, network);
    if (data.account?.id.value != "0.0.0") {
      setPairedWallet(data, network);
      RouterManager.goDashboard();
    }
  };

  function showErrors(data: InitializationData, network: NetworkData): void {
    if (network?.name && !network.recognized) {
      toast.show({
        duration: 5000,
        title: t("changeToRecognizedNetwork"),
        status: "error",
      });
      reset();
    } else if (data && data.account?.id.value.toString() == "0.0.0") {
      toast.show({
        duration: 5000,
        title: t("changeToHederaAccount"),
        status: "error",
      });
      reset();
    }
  }

  const walletConnectionStatusChanged = (
    event: EventParameter<"walletConnectionStatusChanged">,
  ) => {
    console.log("SDK message --> Wallet Connection Status Changed", event);
    setConnectionStatus(WalletStatus.connecting);
  };

  const walletDisconnect = (event: EventParameter<"walletDisconnect">) => {
    console.log("SDK messege --> Wallet disconnected", event);
    // We need to check if we are waiting on connection process, due if we cancel connection on Landing Page
    // and we try again then reset() put connection status on DISCONNECTED and we loose the Connecting transition page
    const isNotConnecting = connectionStatus !== WalletStatus.connecting;
    if (isNotConnecting) {
      console.log("ESTAMOS ENTRANDO AQUI", connectionStatus);
      reset();
    }
  };

  const walletFound = (event: EventParameter<"walletFound">) => {
    if (event) {
      console.log("SDK message --> Wallet found", event);
    }
  };

  const walletEvents = {
    walletConnectionStatusChanged,
    walletDisconnect,
    walletFound,
    walletPaired,
  };

  return <></>;
};
