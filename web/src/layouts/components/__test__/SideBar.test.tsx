import { Sidebar } from "../Sidebar";
import { render } from "../../../test-utils";

describe(`${Sidebar.name}`, () => {
  test("should render correctly", async () => {
    const component = render(<Sidebar />);

    expect(component.getByTestId("sidebar-layout")).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot();
  });
});
