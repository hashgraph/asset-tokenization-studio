import { RoleManagement } from "../RoleManagement";
import { render } from "../../../../../test-utils";

// TODO Improve tests when it is connected to SDK
describe(`${RoleManagement.name}`, () => {
  test("should render correctly", () => {
    const component = render(<RoleManagement />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
