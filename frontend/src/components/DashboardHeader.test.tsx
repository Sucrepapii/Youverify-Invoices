import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardHeader from './DashboardHeader';
import { BrowserRouter } from 'react-router-dom';

// Mock SocketContext to avoid connection errors during test
jest.mock('../context/SocketContext', () => ({
  useSocket: () => ({ socket: null }),
  SocketProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  User: () => <div data-testid="user-icon" />
}));

describe('DashboardHeader', () => {
  test('renders header title', () => {
    render(
      <BrowserRouter>
        <DashboardHeader onMenuClick={() => { }} />
      </BrowserRouter>
    );
    const titleElement = screen.getByText(/INVOICE/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders search input', () => {
    render(
      <BrowserRouter>
        <DashboardHeader onMenuClick={() => { }} />
      </BrowserRouter>
    );
    const searchInput = screen.getByPlaceholderText(/Search invoices.../i);
    expect(searchInput).toBeInTheDocument();
  });
});
