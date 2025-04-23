import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import LoginForm from "@/components/login-form"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

// Mock the hooks
jest.mock("@/contexts/auth-context")
jest.mock("@/hooks/use-toast")

describe("LoginForm", () => {
  beforeEach(() => {
    // Setup default mocks
    ;(useAuth as jest.Mock)
      .mockReturnValue({
        login: jest.fn(),
        isLoading: false,
      })(useToast as jest.Mock)
      .mockReturnValue({
        toast: jest.fn(),
      })
  })

  it("renders the login form correctly", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
  })

  it("handles form submission correctly", async () => {
    const mockLogin = jest.fn().mockResolvedValue({})
    const mockToast = jest.fn()
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
    })
    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    })

    render(<LoginForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    // Check if login was called with correct values
    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123")

    // Wait for the success toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "You have been logged in successfully",
      })
    })
  })

  it("shows loading state during submission", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: true,
    })

    render(<LoginForm />)

    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled()
  })

  it("handles login errors correctly", async () => {
    const mockError = new Error("Invalid credentials")
    const mockLogin = jest.fn().mockRejectedValue(mockError)
    const mockToast = jest.fn()
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
    })
    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    })

    render(<LoginForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong-password" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    // Wait for the error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      })
    })
  })
})
