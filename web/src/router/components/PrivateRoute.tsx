import { Navigate, useLocation } from "react-router-dom";
import { RoutePath } from "../RoutePath";
import { useWalletStore } from "../../store/walletStore";
import { MetamaskStatus } from "../../utils/constants";
import { useEffect } from "react";
import { useLocationStore } from "../../store/locationStore";

export const PrivateRoute = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { connectionStatus } = useWalletStore();
  const connected = connectionStatus === MetamaskStatus.connected;
  const location = useLocation();
  const { locations, setLocations } = useLocationStore();

  useEffect(() => {
    if (
      location.pathname !==
      locations[locations.length ? locations.length - 1 : 0]
    ) {
      setLocations(location.pathname);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return connected ? children : <Navigate to={RoutePath.LANDING} replace />;
};
