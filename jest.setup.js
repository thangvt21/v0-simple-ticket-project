// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js cookies
jest.mock("next/headers", () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({
    data: null,
    error: null,
    isLoading: false,
    mutate: jest.fn(),
  }),
}))

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  }),
)

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
