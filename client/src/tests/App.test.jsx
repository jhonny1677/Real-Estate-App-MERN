import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Prevent socket.io from opening real WebSocket connections during tests
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

// Stub Clerk — tests run without a real publishable key
vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }) => children,
  useUser: () => ({ isSignedIn: false, isLoaded: true, user: null }),
  useClerk: () => ({ signOut: vi.fn() }),
  useAuth: () => ({ isSignedIn: false, isLoaded: true }),
}));

// Prevent axios from making real API calls
vi.mock('axios');

import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
