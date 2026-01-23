// SPDX-License-Identifier: Apache-2.0

import { ActionsButtons } from "../ActionsButtons";
import { render } from "../../../../test-utils";
import { useUserStore } from "../../../../store/userStore";
import { User } from "../../../../utils/constants";

const initialStoreState = useUserStore.getState();

describe(`${ActionsButtons.name}`, () => {
  beforeEach(() => {
    useUserStore.setState(initialStoreState, true);
  });

  const factoryComponent = () => render(<ActionsButtons />);

  test("should render correctly admin buttons", () => {
    useUserStore.setState({
      ...initialStoreState,
      type: User.admin,
    });

    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot("admin");
  });

  test("should render correctly holder buttons", () => {
    useUserStore.setState({
      ...initialStoreState,
      type: User.holder,
    });

    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot("holder");
  });
});
