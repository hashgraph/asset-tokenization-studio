import { fireEvent, waitFor } from "@testing-library/react";
import { render } from "../../../../../test-utils";
import { Locker } from "../Locker";

describe(`${Locker.name}`, () => {
  test("should render correctly", () => {
    const component = render(<Locker />);

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should render the search button disabled if the targetId is empty", () => {
    const component = render(<Locker />);

    const searchButton = component.getByTestId("search-button");

    expect(searchButton).toBeDisabled();
  });

  test("should render the search button enabled if the targetId is not empty", async () => {
    const component = render(<Locker />);

    const searchButton = component.getByTestId("search-button");

    expect(searchButton).toBeDisabled();

    fireEvent.change(component.getByTestId("search"), {
      target: { value: "0.0.12345" },
    });

    await waitFor(() => {
      expect(searchButton).toBeEnabled();
    });
  });
});
