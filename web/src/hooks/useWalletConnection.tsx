import {useWalletStore} from "../store/walletStore";
import {MetamaskStatus} from "../utils/constants";
import {useSDKConnectToWallet} from "./queries/SDKConnection";
import {SupportedWallets} from "@hashgraph/asset-tokenization-sdk";

export const useWalletConnection = () => {
  const { setConnectionStatus } = useWalletStore();
  //TODO: not a good practice to use SupportedWallets from SDK -> use a new WEB enum instead
  const { mutate: connectWallet } = useSDKConnectToWallet();

  const handleConnectWallet = async (wallet: SupportedWallets) => {
    setConnectionStatus(MetamaskStatus.connecting);

    try {
      if (wallet === SupportedWallets.METAMASK) {
        if (window.ethereum) {
          connectWallet(wallet);
        } else {
          setConnectionStatus(MetamaskStatus.uninstalled);
        }
      } else if (wallet === SupportedWallets.HWALLETCONNECT) {
        connectWallet(wallet);
      } else {
        throw new Error("Wallet not supported");
      }
    } catch (error) {
      console.error(error);
      setConnectionStatus(MetamaskStatus.disconnected);
    }
  };

  return {
    handleConnectWallet,
  };
};
