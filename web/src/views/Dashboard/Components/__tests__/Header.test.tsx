import { Header } from "../Header";
import { render } from "../../../../test-utils";

describe(`Dashboard ${Header.name}`, () => {
  test("should render correctly", () => {
    const componet = render(<Header />);

    expect(componet.asFragment()).toMatchSnapshot();
  });
});
