// SPDX-License-Identifier: Apache-2.0

import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Landing } from "../Landing";
import { render } from "../../../test-utils";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { useWalletStore } from "../../../store/walletStore";
import { METAMASK_URL, WalletStatus } from "../../../utils/constants";

jest.mock("../../../router/RouterManager", () => ({
  RouterManager: {
    ...jest.requireActual("../../../router/RouterManager").RouterManager,
    to: jest.fn(),
  },
}));

const initialStoreState = useWalletStore.getState();

describe(`${Landing.name}`, () => {
  const accounts = ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045"];

  afterEach(() => {
    jest.clearAllMocks();
    useWalletStore.setState(initialStoreState, true);
  });

  test("should render correctly", async () => {
    const component = render(<Landing />);

    await waitFor(() => {
      expect(component.getByTestId("landing-page"));
    });

    expect(component.asFragment()).toMatchSnapshot("disconnected");
  });

  test("if user connect to metamask then should redirect to dashboard", async () => {
    useWalletStore.setState(
      {
        ...initialStoreState,
        connectionStatus: WalletStatus.connected,
        address: accounts[0],
      },
      true,
    );

    const component = render(<Landing />);

    await waitFor(() => {
      expect(component.getByTestId("landing-page"));
    });

    const button = component.getByTestId("connect-to-metamask-landing-button");
    userEvent.click(button);

    await waitFor(() => {
      expect(component.queryByTestId("landing-page")).not.toBeInTheDocument();
    });

    expect(component.asFragment()).toMatchSnapshot("connecting");
    expect(RouterManager.to).toHaveBeenCalledTimes(1);
    expect(RouterManager.to).toHaveBeenCalledWith(RouteName.Dashboard);
  });

  test("if metamask can't connect then should go back to landing page", async () => {
    const component = render(<Landing />);

    await waitFor(() => {
      expect(component.getByTestId("landing-page"));
    });

    const button = component.getByTestId("connect-to-metamask-landing-button");

    userEvent.click(button);
    useWalletStore.setState({ ...initialStoreState, connectionStatus: WalletStatus.connecting }, true);

    await waitFor(() => {
      expect(component.queryByTestId("landing-page")).not.toBeInTheDocument();
      expect(component.getByTestId("connecting-to-metamask")).toBeInTheDocument();
    });

    useWalletStore.setState(initialStoreState, true);

    expect(RouterManager.to).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      expect(component.getByTestId("landing-page")).toBeInTheDocument();
    });
  });

  test("if metamask is not installed then should open popup with button to install", async () => {
    const component = render(<Landing />);
    const uninstalled = {
      ...initialStoreState,
      connectionStatus: WalletStatus.uninstalled,
    };
    useWalletStore.setState(uninstalled, true);

    await waitFor(() => {
      expect(component.getByTestId("install-metamask")).toBeInTheDocument();
    });

    expect(component.asFragment()).toMatchSnapshot("uninstalled");
  });

  test("if click on install metamask button should open metamask page and go back to landing page", async () => {
    const oldWindowOpen = window.open;
    window.open = jest.fn();
    const component = render(<Landing />);

    const uninstalled = {
      ...initialStoreState,
      connectionStatus: WalletStatus.uninstalled,
    };
    useWalletStore.setState(uninstalled, true);

    await waitFor(() => {
      expect(component.getByTestId("install-metamask")).toBeInTheDocument();
    });

    const installButton = component.getByTestId("install-metamask-extension-button");
    userEvent.click(installButton);

    await waitFor(() => {
      expect(global.window.open).toHaveBeenCalledWith(METAMASK_URL, "_blank");
      expect(component.getByTestId("landing-page"));
    });

    window.open = oldWindowOpen;
  });
});
