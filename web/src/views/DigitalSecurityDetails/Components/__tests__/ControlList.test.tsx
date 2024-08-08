import { ControlList } from "../ControlList";
import { render } from "../../../../test-utils";
import { useSecurityStore } from "../../../../store/securityStore";

const initialStoreState = useSecurityStore.getState();

const testSecurity = {
  decimals: 18,
  diamondAddress: "0.0.5863436",
  evmDiamondAddress: "0x83887e04c70e0b857738f89d12bf018bc0fe0310",
  isControllable: true,
  isWhiteList: true,
  isin: "123456789102",
  name: "Equity Total",
  paused: false,
  securityType: "EQUITY",
  symbol: "ET",
  totalSupply: "1150000000000000000000",
};

describe(`${ControlList.name}`, () => {
  beforeEach(() => {
    useSecurityStore.setState(
      {
        ...initialStoreState,
        details: testSecurity,
      },
      true,
    );
  });

  const factoryComponent = () => render(<ControlList />);

  test("should render correctly as whiteList", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot("whiteList");
  });

  test("should render correctly as blockList", () => {
    useSecurityStore.setState(
      {
        ...initialStoreState,
        details: { ...testSecurity, isWhiteList: false },
      },
      true,
    );
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot("blockList");
  });

  test("should render table with list", () => {
    const component = factoryComponent();

    expect(component.getByTestId("table-control-list")).toBeInTheDocument();
  });
});
