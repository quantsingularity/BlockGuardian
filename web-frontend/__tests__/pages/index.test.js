// Page Test: /home/ubuntu/BlockGuardian_Tests/BlockGuardian_tests/web-frontend/__tests__/pages/index.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For .toBeInTheDocument()
import Home from '../../../../BlockGuardian_Project/web-frontend/pages/index';

// Mock next/link behavior for testing
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock the Layout component to isolate the Home page content
jest.mock('../../../../BlockGuardian_Project/web-frontend/components/Layout', () => {
  // eslint-disable-next-line react/display-name
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

describe('Index Page (Home)', () => {
  // Mock props that might be passed down from _app.js or Layout
  const mockToggleDarkMode = jest.fn();
  const defaultProps = {
    darkMode: false,
    toggleDarkMode: mockToggleDarkMode,
  };

  beforeEach(() => {
    mockToggleDarkMode.mockClear();
  });

  test('renders main heading and description', () => {
    render(<Home {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /QuantumNest Capital/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/A futuristic fintech platform integrating AI, Blockchain, Data Science, and Automation/i)).toBeInTheDocument();
  });

  test('renders call-to-action buttons/links', () => {
    render(<Home {...defaultProps} />);
    expect(screen.getByRole('link', { name: /Explore Portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();
  });

  test('renders feature sections with headings and links', () => {
    render(<Home {...defaultProps} />);
    // Feature 1
    expect(screen.getByRole('heading', { name: /AI-Powered Analytics/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Advanced machine learning models for financial prediction/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Learn more →/i })[0]).toHaveAttribute('href', '/ai-recommendations');

    // Feature 2
    expect(screen.getByRole('heading', { name: /Blockchain Integration/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Secure transactions with Ethereum smart contracts/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Learn more →/i })[1]).toHaveAttribute('href', '/blockchain-explorer');

    // Feature 3
    expect(screen.getByRole('heading', { name: /Real-time Data/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Live financial data streaming with advanced visualization/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Learn more →/i })[2]).toHaveAttribute('href', '/market-analysis');
  });

  test('renders "Why Choose" section with sub-features', () => {
    render(<Home {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /Why Choose QuantumNest Capital\?/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Advanced Security/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Performance Optimization/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Intelligent Insights/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Real-time Monitoring/i, level: 3 })).toBeInTheDocument();
  });

  // No interactive elements like buttons with onClick handlers directly in Home component itself
  // (besides the dark mode toggle which is assumed to be in Layout/Navbar)
  // So, no fireEvent tests needed here unless more interactivity is added to index.js
});

