import _capitalize from "lodash/capitalize";
import { useWalletStore } from "../store/walletStore";
import {MetamaskStatus, Wallets} from "../utils/constants";
import { useSDKConnectToWallet } from "./queries/SDKConnection";
import {SupportedWallets} from "@hashgraph/asset-tokenization-sdk";

export const useWalletConnection = () => {
  const { setConnectionStatus } = useWalletStore();
  const { mutate: connectWallet } = useSDKConnectToWallet();
  //TODO: not a good practice to use SupportedWallets from SDK -> use a new WEB enum instead
  const handleConnectWallet = async (wallet:SupportedWallets) => {
    setConnectionStatus(MetamaskStatus.connecting);
    try {
      if (window.ethereum) {
        connectWallet(wallet);
      } else {
        setConnectionStatus(MetamaskStatus.uninstalled);
      }
    } catch (error) {
      console.error(error);
      // setConnectionStatus(MetamaskStatus.disconnected);
    }
  };

  return {
    handleConnectWallet,
  };
};
