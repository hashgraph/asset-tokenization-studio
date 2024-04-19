import { ProgramVotingRights } from "../ProgramVotingRights";
import { render, selectCalendar } from "../../../../../test-utils";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";

const name = "TestName";

// TODO Improve tests when it is connected to SDK
describe(`${ProgramVotingRights.name}`, () => {
  const factoryComponent = () => render(<ProgramVotingRights />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should fill form", async () => {
    const component = factoryComponent();

    const submitButton = component.getByTestId("program-vote-button");
    expect(submitButton).toBeDisabled();

    const nameInput = component.getByTestId("name");
    await userEvent.type(nameInput, name);

    await selectCalendar(component, "date");

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await userEvent.click(submitButton);
  });
});
