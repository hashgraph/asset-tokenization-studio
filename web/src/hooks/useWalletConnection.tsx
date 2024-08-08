import _capitalize from "lodash/capitalize";
import { useWalletStore } from "../store/walletStore";
import { MetamaskStatus } from "../utils/constants";
import { useSDKConnectToMetamask } from "./queries/SDKConnection";

export const useWalletConnection = () => {
  const { setConnectionStatus } = useWalletStore();
  const { mutate: connectWallet } = useSDKConnectToMetamask();

  const handleConnectWallet = async () => {
    setConnectionStatus(MetamaskStatus.connecting);
    try {
      if (window.ethereum) {
        connectWallet();
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
