import { Header } from "../Header";
import { useWalletStore } from "../../../store/walletStore";
import { render } from "../../../test-utils";
import { WalletStatus } from "../../../utils/constants";
import _capitalize from "lodash/capitalize";

const initialStoreState = useWalletStore.getState();

describe(`${Header.name}`, () => {
  afterEach(() => {
    jest.clearAllMocks();
    useWalletStore.setState(initialStoreState, true);
  });

  test("if user is not connected should show connect button", async () => {
    const component = render(<Header />);

    expect(component.getByTestId("header-layout")).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("disconnected");
  });

  test("if user is connected should show address", async () => {
    const connected = {
      initialStoreState,
      connectionStatus: WalletStatus.connected,
      address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    };
    useWalletStore.setState(connected, true);

    const component = render(<Header />);

    expect(component.getByTestId("header-layout")).toBeInTheDocument();
    expect(
      component.getByText((content, _element) => content.startsWith("0x")),
    );
    expect(component.asFragment()).toMatchSnapshot("connected");
  });
});
