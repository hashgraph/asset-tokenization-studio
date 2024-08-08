export default {
  connectYour: "Connect your",
  wallet: "wallet",
  welcomeMessage: "Please, connect your wallet to start operating.",
  instructions:
    "<p>Instructions to set up your Hedera account and your Metamask wallet:</p> <ol><li>Configure the Hedera Testnet Network in Metamask and connect Metamask to it. Recommendation: <a href='https://chainlist.org/chain/296'>use Chainlist</a>.</li> <li> Create an ECDSA account in the <a href='https://portal.hedera.com/'>Hedera Portal</a>.</li> <li>Import the Private Key in Metamask (<a href='https://support.metamask.io/hc/en-us/articles/360015489331-How-to-import-an-account'>instructions</a>). </li><li>Switch to that new account in Metamask (<a href='https://support.metamask.io/hc/en-us/articles/360061346311-Switching-accounts-in-MetaMask'>instructions</a>). </li><li>Authorize the Token Studio site to use the account.</li></ol>",
  metamaskPopup: {
    connecting: {
      title: "Connecting to Metamask...",
      description: "Please, confirm in Metamask wallet extension.",
    },
    uninstalled: {
      title: "No Metamask installed.",
      description: "Please, connect the Metamask extension in your browser.",
      button: "Install Metamask extension",
    },
  },
};
