import { useMutation } from "@tanstack/react-query";
import { SDKService } from "../../services/SDKService";
import type { WalletEvent } from "@hashgraph/asset-tokenization-sdk";
import { SupportedWallets } from "@hashgraph/asset-tokenization-sdk";
import { useWalletStore } from "../../store/walletStore";
import { WalletStatus } from "../../utils/constants";

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

export const useSDKConnectToWallet = () => {
  const { setConnectionStatus, reset } = useWalletStore();

  return useMutation(
    (wallet: SupportedWallets) => SDKService.connectWallet(wallet),
    {
      cacheTime: 0,
      onSuccess: (data) => {
        console.log("SDK message --> Connected to wallet", data);
        //setConnectionStatus(MetamaskStatus.connected);
      },
      onError: (error) => {
        console.log("SDK message --> Error connecting to wallet: ", error);
        reset();
      },
      onMutate: () => {
        setConnectionStatus(WalletStatus.connecting);
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
