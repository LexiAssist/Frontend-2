import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

// ── Environment mocks ────────────────────────────────────────────────────────

vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL: 'http://localhost:8080',
    NEXT_PUBLIC_AI_PROXY_URL: 'http://localhost:8081',
    NEXT_PUBLIC_WS_URL: 'ws://localhost:8080',
    NEXT_PUBLIC_USE_MOCK_API: 'false',
    NEXT_PUBLIC_MOCK_MODE: 'false',
    DATABASE_URL: undefined,
    NODE_ENV: 'test',
  },
  isMockMode: () => false,
}));

// ── Next.js mocks ────────────────────────────────────────────────────────────

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: Record<string, unknown>) {
    return React.createElement('img', { ...props, alt: (props.alt as string) || '' });
  },
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) {
    return React.createElement('a', props, children);
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('next/font/google', () => ({
  Inter: () => ({ className: 'font-inter', variable: '--font-inter', style: { fontFamily: 'Inter' } }),
  Roboto: () => ({ className: 'font-roboto', variable: '--font-roboto', style: { fontFamily: 'Roboto' } }),
}));

// ── Browser API mocks ────────────────────────────────────────────────────────

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
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

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});
