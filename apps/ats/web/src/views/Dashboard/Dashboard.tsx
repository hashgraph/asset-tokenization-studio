// SPDX-License-Identifier: Apache-2.0

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
import { useSecurityStore } from "../../store/securityStore";

export const Dashboard = () => {
  const { setType } = useUserStore();
  const { adminSecurities, holderSecurities } = useAccountStore();
  const { setRoles } = useRolesStore();
  const { address } = useWalletStore();
  const { setDetails } = useSecurityStore();

  useEffect(() => {
    setRoles([]);
    setType(User.general);
    setDetails(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userHasTokens =
    // eslint-disable-next-line no-prototype-builtins
    adminSecurities.hasOwnProperty(address) || holderSecurities.hasOwnProperty(address);

  return (
    <>
      <Header />
      {userHasTokens ? <TokensList /> : <NoTokens />}
    </>
  );
};
