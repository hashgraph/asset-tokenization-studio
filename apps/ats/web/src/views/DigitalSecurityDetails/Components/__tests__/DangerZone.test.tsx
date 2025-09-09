import { render } from '../../../../test-utils';
import { useRolesStore } from '../../../../store/rolesStore';
import { SecurityRole } from '../../../../utils/SecurityRole';
import userEvent from '@testing-library/user-event';
import { usePauseSecurity } from '../../../../hooks/queries/usePauseSecurity';
import { useUnpauseSecurity } from '../../../../hooks/queries/useUnpauseSecurity';
import { DangerZone } from '../DangerZone';

jest.mock('../../../../router/RouterManager', () => ({
  RouterManager: {
    ...jest.requireActual('../../../../router/RouterManager').RouterManager,
    getUrl: jest.fn(),
    to: jest.fn(),
  },
}));

jest.mock('../../../../hooks/queries/usePauseSecurity', () => ({
  usePauseSecurity: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
  })),
}));

// Mock para useGetIsPaused
jest.mock('../../../../hooks/queries/useGetSecurityDetails', () => ({
  useGetIsPaused: jest.fn(() => ({
    data: false,
    refetch: jest.fn(),
    isPending: false,
  })),
}));

jest.mock('../../../../hooks/queries/useUnpauseSecurity', () => ({
  useUnpauseSecurity: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
  })),
}));

const defaultAdminRole = [SecurityRole._DEFAULT_ADMIN_ROLE];
const initialStoreState = useRolesStore.getState();

describe(`${DangerZone.name}`, () => {
  beforeEach(() => {
    useRolesStore.setState(initialStoreState, true);
    jest.clearAllMocks();
  });

  const factoryComponent = () => render(<DangerZone />);

  test('should render correctly', () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot('defaultAdminRole');
  });

  test('by default admin has not pauser role', () => {
    const component = factoryComponent();

    expect(component.queryByTestId('pauser-button')).not.toBeInTheDocument();
  });

  describe('Admin has pauser role', () => {
    beforeEach(() => {
      useRolesStore.setState({
        ...initialStoreState,
        roles: [...defaultAdminRole, SecurityRole._PAUSER_ROLE],
      });
    });

    test('should render correctly', () => {
      const component = factoryComponent();

      expect(component.asFragment()).toMatchSnapshot('pauserRole');
    });

    test('should show pauser spinner toggle', () => {
      const component = factoryComponent();

      expect(component.getByTestId('pauser-button')).toBeInTheDocument();
    });

    test('if click on pauser button should call to pause or unpause security function', async () => {
      const component = factoryComponent();

      const button = component.getByTestId('pauser-button');
      expect(button).toBeInTheDocument();

      await userEvent.click(button);

      expect(usePauseSecurity).toHaveBeenCalled();
      expect(usePauseSecurity).toHaveBeenCalledWith({
        onSettled: expect.anything(),
      });

      await userEvent.click(button);

      expect(useUnpauseSecurity).toHaveBeenCalled();
      expect(useUnpauseSecurity).toHaveBeenCalledWith({
        onSettled: expect.anything(),
      });
    });
  });
});
