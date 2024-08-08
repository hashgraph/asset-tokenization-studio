import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import type { WalletEvent } from "@hashgraph/asset-tokenization-sdk";
import { SupportedWallets } from "@hashgraph/asset-tokenization-sdk";
import { useWalletStore } from "../../store/walletStore";
import { MetamaskStatus } from "../../utils/constants";

export const useSDKInit = () =>
  useMutation(
    (walletEvents: Partial<WalletEvent>) => SDKService.init(walletEvents),
    {
      onSuccess: (data) => {
        console.log("SDK message --> Initialization successs: ", data);
      },
      onError: (error) => {
        console.log("SDK message --> Initialization error: ", error);
      },
    },
  );

export const useSDKConnectToMetamask = () => {
  const { setConnectionStatus, reset } = useWalletStore();

  return useMutation(
    () => SDKService.connectWallet(SupportedWallets.METAMASK),
    {
      cacheTime: 0,
      onSuccess: (data) => {
        console.log("SDK message --> Connected to Metamask", data);
        //setConnectionStatus(MetamaskStatus.connected);
      },
      onError: (error) => {
        console.log("SDK message --> Error connecting to Metamask: ", error);
        reset();
      },
      onMutate: () => {
        setConnectionStatus(MetamaskStatus.connecting);
      },
    },
  );
};

export const useSDKDisconnectFromMetamask = () => {
  const { reset } = useWalletStore();

  return useMutation(() => SDKService.disconnectWallet(), {
    cacheTime: 0,
    onSuccess: (data) => {
      console.log("SDK message --> Connected to Metamask", data);
      reset();
    },
    onError: (error) => {
      console.log("SDK message --> Error connecting to Metamask: ", error);
      reset();
    },
  });
};
