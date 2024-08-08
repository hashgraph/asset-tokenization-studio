import { SeeVotingRights } from "../SeeVotingRights";
import { render } from "../../../../../test-utils";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";

const votingId = "123456";
const accountId = "0.0.1234567";

// TODO Improve tests when it is connected to SDK
describe(`${SeeVotingRights.name}`, () => {
  const factoryComponent = () => render(<SeeVotingRights />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should fill form", async () => {
    const component = factoryComponent();

    const submitButton = component.getByTestId("check-button");
    expect(submitButton).toBeDisabled();

    const votingIdInput = component.getByTestId("votingId");
    await userEvent.type(votingIdInput, votingId);

    const accountIdInput = component.getByTestId("accountId");
    await userEvent.type(accountIdInput, accountId);

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await userEvent.click(submitButton);
  });
});
