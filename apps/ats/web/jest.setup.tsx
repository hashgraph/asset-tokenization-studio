process.env.VITE_API_URL = 'http://localhost:8080/api/v1';

// Mock Terminal3 modules to avoid LRU cache issues
jest.mock('@terminal3/verify_vc');
jest.mock('@terminal3/bbs_vc');

import Select from 'react-select';
import { TextEncoder, TextDecoder } from 'util';

// Cast to any to bridge Node util types with JSDOM globals
(global as any).TextEncoder = TextEncoder as any;
(global as any).TextDecoder = TextDecoder as any;

jest.doMock('chakra-react-select', () => ({
  ...jest.requireActual('chakra-react-select'),
  // @ts-ignore
  Select: ({ _components, ...props }) => <Select {...props} />,
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const noop = () => {};
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });
