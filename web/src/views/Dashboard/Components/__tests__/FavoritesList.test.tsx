import { FavoritesList } from "../FavoritesList";
import { render } from "../../../../test-utils";
import { User } from "../../../../utils/constants";

// TODO mock adminSecurities, holderSecurities in AccountStore and SecurityStore
describe.skip(`${FavoritesList.name}`, () => {
  test("should render correctly as admin", () => {
    const component = render(<FavoritesList type={User.admin} />);

    expect(component.asFragment()).toMatchSnapshot("admin");
  });

  test("should render correctly as admin", () => {
    const component = render(<FavoritesList type={User.holder} />);

    expect(component.asFragment()).toMatchSnapshot("holder");
  });
});
