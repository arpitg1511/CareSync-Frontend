import { render, screen } from '@testing-library/react';
import { Home } from './Home';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

let mockIsAuthenticated = false;
let mockUser = null;

// Mock useAuthStore
jest.mock('../store/useAuthStore', () => ({
  __esModule: true,
  default: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

describe('Home Page', () => {
  test('renders Home page with hero text', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check if main heading is present
    expect(screen.getByText(/Your Health,/i)).toBeInTheDocument();
    expect(screen.getByText(/Syncronized/i)).toBeInTheDocument();
    
    // Check if "Sign In Now" button is present (unauthenticated state)
    expect(screen.getByText(/Sign In Now/i)).toBeInTheDocument();
  });

  test('renders "Go to Dashboard" when authenticated', () => {
    // Update mock state
    mockIsAuthenticated = true;
    mockUser = { name: 'Test User' };

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Go to Dashboard/i)).toBeInTheDocument();
  });
});
