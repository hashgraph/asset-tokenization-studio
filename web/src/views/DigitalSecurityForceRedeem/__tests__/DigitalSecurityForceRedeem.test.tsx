import { DigitalSecurityForceRedeem } from "../DigitalSecurityForceRedeem";
import { render } from "../../../test-utils";

describe(`${DigitalSecurityForceRedeem.name}`, () => {
  const factoryComponent = () => {
    return render(<DigitalSecurityForceRedeem />);
  };

  test("render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should show Goback button", () => {
    const component = factoryComponent();

    const breadcrumbs = component.getByTestId("go-back-button");
    expect(breadcrumbs).toBeInTheDocument();
  });

  test("should show breadcrumbs", () => {
    const component = factoryComponent();

    const breadcrumbs = component.getByTestId("breadcrumb-desktop");
    expect(breadcrumbs).toBeInTheDocument();
  });

  test("should form be rendered properly", () => {
    const component = factoryComponent();

    const form = component.getByTestId("force-redeem-form");
    expect(form).toBeInTheDocument();
  });
});
