// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterControls } from "../components/FilterControls";
import { render } from "@/test-utils";

// Mock io-bricks-ui components
jest.mock("io-bricks-ui", () => ({
  SearchInputController: ({ id, placeholder, control, onSearch, ...props }: any) => (
    <input
      data-testid={`search-input-controller`}
      data-id={id}
      data-placeholder={placeholder}
      onChange={(e) => {
        // Simulate react-hook-form behavior
        control.setValue(id, e.target.value);
      }}
      {...props}
    />
  ),
  SelectController: ({ id, placeholder, options, control, isSearchable, ...props }: any) => (
    <div
      data-testid="select-controller"
      data-id={id}
      data-searchable={isSearchable?.toString()}
      data-options-count={"3"}
    >
      <select
        data-testid={`select-${id}`}
        onChange={(e) => {
          // Simulate react-hook-form behavior
          control.setValue(id, e.target.value);
        }}
        {...props}
      >
        <option value="">{placeholder}</option>
        <option value="dividend">Dividend</option>
        <option value="interest">Interest</option>
        <option value="principal">Principal</option>
      </select>
    </div>
  ),
}));

// Mock PlaceholderWithIcon
jest.mock("../../Components/PlaceholderWithIcon", () => ({
  PlaceholderWithIcon: () => <div data-testid="placeholder-with-icon">Placeholder Icon</div>,
}));

// Mock io-bricks-ui Theme
jest.mock("io-bricks-ui/Theme", () => ({
  BasePlatformTheme: {
    colors: {},
    breakpoints: {},
  },
}));

// Mock Chakra UI components
jest.mock("@chakra-ui/react", () => ({
  Box: ({ children, ...props }: any) => (
    <div className="css-kq3qcu" {...props}>
      {children}
    </div>
  ),
  Stack: ({ children, ...props }: any) => (
    <div className="chakra-stack css-spc5cv" data-testid="stack" {...props}>
      {children}
    </div>
  ),
  ChakraProvider: ({ children }: any) => (
    <div>
      {children}
      <span hidden id="__chakra_env" />
    </div>
  ),
  extendTheme: jest.fn(() => ({})),
}));

const mockControl = {
  setValue: jest.fn(),
  register: jest.fn(),
  formState: { errors: {} },
  watch: jest.fn(),
  getValues: jest.fn(() => ({ search: "", distributionType: "" })),
};

const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    "filters.searchPlaceholder": "Search distributions...",
    "filters.distributionType": "Distribution Type",
    "filters.all": "All",
  };
  return translations[key] || key;
});

const defaultProps = {
  control: mockControl as any,
  t: mockT as any,
};

const renderFilterControls = (props = {}) => {
  return render(<FilterControls {...defaultProps} {...props} />);
};

describe("FilterControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should match snapshot", () => {
      const component = renderFilterControls();
      expect(component.asFragment()).toMatchSnapshot();
    });
    it("should render filter controls container", () => {
      renderFilterControls();

      expect(screen.getByTestId("stack")).toBeInTheDocument();
    });

    it("should render distribution type select controller", () => {
      renderFilterControls();

      const selectController = screen.getByTestId("select-controller");
      expect(selectController).toBeInTheDocument();
      expect(selectController).toHaveAttribute("data-id", "distributionType");
      expect(selectController).toHaveAttribute("data-searchable", "false");
      expect(selectController).toHaveAttribute("data-options-count", "3");
    });

    it("should render placeholder with icon in select", () => {
      renderFilterControls();

      expect(screen.getByTestId("placeholder-with-icon")).toBeInTheDocument();
      expect(screen.getByText("Placeholder Icon")).toBeInTheDocument();
    });

    it("should render distribution type options", () => {
      renderFilterControls();

      const select = screen.getByTestId("select-distributionType");
      expect(select).toBeInTheDocument();

      // Check if options are rendered
      expect(screen.getByText("Dividend")).toBeInTheDocument();
      expect(screen.getByText("Interest")).toBeInTheDocument();
      expect(screen.getByText("Principal")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle distribution type selection", async () => {
      const user = userEvent.setup();
      renderFilterControls();

      const select = screen.getByTestId("select-distributionType");
      await user.selectOptions(select, "dividend");

      expect(mockControl.setValue).toHaveBeenCalledWith("distributionType", "dividend");
    });

    it("should handle select change with fireEvent", () => {
      renderFilterControls();

      const select = screen.getByTestId("select-distributionType");
      fireEvent.change(select, { target: { value: "interest" } });

      expect(mockControl.setValue).toHaveBeenCalledWith("distributionType", "interest");
    });
  });

  describe("Props Integration", () => {
    it("should pass control to both controllers", () => {
      renderFilterControls();

      const selectController = screen.getByTestId("select-controller");
      const searchController = screen.getByTestId("search-input-controller");

      expect(selectController).toBeInTheDocument();
      expect(searchController).toBeInTheDocument();
    });

    it("should use translation function for search placeholder", () => {
      renderFilterControls();

      expect(mockT).toHaveBeenCalledWith("filters.searchPlaceholder");

      const searchController = screen.getByTestId("search-input-controller");
      expect(searchController).toHaveAttribute("data-placeholder", "Search distributions...");
    });

    it("should handle custom translation function", () => {
      const customT = jest.fn((key: string) => `Custom: ${key}`);

      renderFilterControls({ t: customT });

      expect(customT).toHaveBeenCalledWith("filters.searchPlaceholder");

      const searchController = screen.getByTestId("search-input-controller");
      expect(searchController).toHaveAttribute("data-placeholder", "Custom: filters.searchPlaceholder");
    });
  });
});
