import { VotingRights } from "../VotingRights";
import { render } from "../../../../../test-utils";

describe(`${VotingRights.name}`, () => {
  test("should render correctly", () => {
    const component = render(<VotingRights />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
