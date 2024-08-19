import _capitalize from "lodash/capitalize";
import { useWalletStore } from "../store/walletStore";
import {MetamaskStatus, Wallets} from "../utils/constants";
import { useSDKConnectToWallet } from "./queries/SDKConnection";

export const useWalletConnection = () => {
  const { setConnectionStatus } = useWalletStore();
  const { mutate: connectWallet } = useSDKConnectToWallet();

  const handleConnectWallet = async (wallet:Wallets) => {
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
