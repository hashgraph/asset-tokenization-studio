import { AddFavorite } from "../AddFavorite";
import { render } from "../../../../test-utils";
import userEvent from "@testing-library/user-event";
import { RouterManager } from "../../../../router/RouterManager";
import { waitFor } from "@testing-library/react";

jest.mock("../../../../router/RouterManager", () => ({
  RouterManager: {
    ...jest.requireActual("../../../../router/RouterManager").RouterManager,
    to: jest.fn(),
  },
}));

describe(`${AddFavorite.name}`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("render correctly as admin", () => {
    const component = render(<AddFavorite isAdmin={true} />);

    expect(component.asFragment()).toMatchSnapshot("admin");
  });

  test("render correctly as holder", () => {
    const component = render(<AddFavorite isAdmin={false} />);

    expect(component.asFragment()).toMatchSnapshot("holder");
  });

  test("if click on button then redirect to Admin Securities List page", async () => {
    const component = render(<AddFavorite isAdmin={true} />);

    const button = component.getByTestId("add-favorite-button");
    userEvent.click(button);

    await waitFor(
      () => {
        expect(RouterManager.to).toHaveBeenCalledTimes(1);
        expect(RouterManager.to).toHaveBeenCalledWith(
          "DIGITAL_SECURITIES_LIST",
          {
            params: { type: "admin" },
          },
        );
      },
      { timeout: 30000 },
    );
  });

  test("if click on button then redirect to Holder Securities List page", async () => {
    const component = render(<AddFavorite isAdmin={false} />);

    const button = component.getByTestId("add-favorite-button");
    userEvent.click(button);

    await waitFor(
      () => {
        expect(RouterManager.to).toHaveBeenCalledTimes(1);
        expect(RouterManager.to).toHaveBeenCalledWith(
          "DIGITAL_SECURITIES_LIST",
          {
            params: { type: "holder" },
          },
        );
      },
      { timeout: 30000 },
    );
  });
});
