/* eslint-disable no-prototype-builtins */
import { useEffect } from "react";
import { Header } from "./Components/Header";
import { NoTokens } from "./Components/NoTokens";
import { TokensList } from "./Components/TokensList";
import { useUserStore } from "../../store/userStore";
import { User } from "../../utils/constants";
import { useAccountStore } from "../../store/accountStore";
import { useRolesStore } from "../../store/rolesStore";
import { useWalletStore } from "../../store/walletStore";

export const Dashboard = () => {
  const { setType } = useUserStore();
  const { adminSecurities, holderSecurities } = useAccountStore();
  const { setRoles } = useRolesStore();
  const { address } = useWalletStore();

  useEffect(() => {
    setRoles([]);
    setType(User.general);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userHasTokens =
    // eslint-disable-next-line no-prototype-builtins
    adminSecurities.hasOwnProperty(address) ||
    holderSecurities.hasOwnProperty(address);

  return (
    <>
      <Header />
      {userHasTokens ? <TokensList /> : <NoTokens />}
    </>
  );
};
