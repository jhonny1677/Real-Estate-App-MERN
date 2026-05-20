import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── Browser APIs not implemented by jsdom ─────────────────────────────────
// These are stubbed globally so modules that reference them at load time
// (e.g. notificationService.js) don't throw during tests.

global.Notification = class MockNotification {
  static permission = 'default';
  static requestPermission() { return Promise.resolve('default'); }
  constructor() {}
  close() {}
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
