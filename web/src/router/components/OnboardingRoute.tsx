import { GenericRoute } from "./GenericRoute";

export const OnboardingRoute = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const user = false;
  return !user ? children : <GenericRoute />;
};
