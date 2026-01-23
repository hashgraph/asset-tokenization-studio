// SPDX-License-Identifier: Apache-2.0

import { Header, HeaderProps } from "../Header";
import { render } from "../../test-utils";

const defaultProps: HeaderProps = {
  page: "digitalSecuritiesList",
};

describe(`${Header.name}`, () => {
  test("should render correctly", () => {
    const component = render(<Header {...defaultProps} />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
