import { MainLayout } from "../MainLayout";
import { useWalletStore } from "../../store/walletStore";
import { render } from "../../test-utils";
import { WalletStatus } from "../../utils/constants";

const initialStoreState = useWalletStore.getState();

describe(`${MainLayout.name}`, () => {
  afterEach(() => {
    jest.clearAllMocks();
    useWalletStore.setState(initialStoreState, true);
  });

  test("if user is not connected should not render sidebar", async () => {
    const component = render(<MainLayout />);

    expect(component.getByTestId("header-layout")).toBeInTheDocument();
    expect(component.queryByTestId("sidebar-layout")).not.toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("disconnected");
  });

  test("if user is not connected should not render sidebar", async () => {
    const connected = {
      initialStoreState,
      connectionStatus: WalletStatus.connected,
      address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    };
    useWalletStore.setState(connected, true);

    const component = render(<MainLayout />);

    expect(component.getByTestId("header-layout")).toBeInTheDocument();
    expect(component.getByTestId("sidebar-layout")).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("connected");
  });
});
