import _capitalize from "lodash/capitalize";
import { useWalletStore } from "../store/walletStore";
import { WalletStatus } from "../utils/constants";
import { useSDKConnectToWallet } from "./queries/SDKConnection";
import { SupportedWallets } from "@hashgraph/asset-tokenization-sdk";

export const useWalletConnection = () => {
  const { setConnectionStatus } = useWalletStore();
  //TODO: not a good practice to use SupportedWallets from SDK -> use a new WEB enum instead
  const { mutate: connectWallet } = useSDKConnectToWallet();

  const handleConnectWallet = async (wallet: SupportedWallets) => {
    try {
      setConnectionStatus(WalletStatus.connecting);
      if (wallet === SupportedWallets.METAMASK && window.ethereum) {
        connectWallet(wallet);
      } else if (wallet === SupportedWallets.HWALLETCONNECT) {
        connectWallet(wallet);
      } else {
        throw new Error("Wallet not supported");
      }
    } catch (error) {
      console.error(error);
      setConnectionStatus(WalletStatus.disconnected);
    }
  };

  return {
    handleConnectWallet,
  };
};
