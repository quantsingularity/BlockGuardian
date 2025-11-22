// Component Test: /home/ubuntu/BlockGuardian_Tests/BlockGuardian_tests/web-frontend/__tests__/components/Navbar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // For .toBeInTheDocument()
import Navbar from '../../../../BlockGuardian_Project/web-frontend/components/Navbar';

// Mock next/link behavior for testing
jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('Navbar Component', () => {
    const mockToggleDarkMode = jest.fn();

    beforeEach(() => {
        // Reset mocks before each test
        mockToggleDarkMode.mockClear();
    });

    test('renders brand name', () => {
        render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
        expect(screen.getByText('QuantumNest')).toBeInTheDocument();
    });

    test('renders desktop navigation links', () => {
        render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
        // Check for a few key links visible on desktop
        expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Portfolio/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Market Analysis/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /AI Recommendations/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Blockchain Explorer/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    });

    test('renders dark mode toggle button (light mode)', () => {
        render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
        const toggleButton = screen.getByRole('button', { name: /🌙/i }); // Moon icon for switching to dark
        expect(toggleButton).toBeInTheDocument();
        fireEvent.click(toggleButton);
        expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    test('renders dark mode toggle button (dark mode)', () => {
        render(<Navbar darkMode={true} toggleDarkMode={mockToggleDarkMode} />);
        const toggleButton = screen.getByRole('button', { name: /☀️/i }); // Sun icon for switching to light
        expect(toggleButton).toBeInTheDocument();
        fireEvent.click(toggleButton);
        expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    test('toggles mobile menu visibility', () => {
        render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
        const menuButton = screen.getByRole('button', { name: /Open main menu/i });

        // Initially, mobile menu specific links should not be visible (unless screen size forces it, but testing library defaults usually don't)
        // Let's check for a link that's definitely in the mobile section
        expect(screen.queryByRole('link', { name: /Portfolio/i, hidden: false })).not.toHaveClass(
            'sm:hidden',
        ); // Desktop link exists
        // A link specifically styled for mobile might be harder to query directly without data-testid, let's check visibility toggle

        // Open menu
        fireEvent.click(menuButton);
        // Check if close icon is now visible
        expect(
            screen
                .getByRole('button', { name: /Open main menu/i })
                .querySelector('svg path[d="M6 18L18 6M6 6l12 12"]'),
        ).toBeInTheDocument();
        // Check if a mobile-specific element/link is now conceptually visible (difficult to test precisely without specific styling/ids)
        // We can check if the button text changes in the mobile menu for dark mode toggle
        expect(screen.getByRole('button', { name: /Switch to Dark Mode 🌙/i })).toBeInTheDocument();

        // Close menu
        fireEvent.click(menuButton);
        // Check if open icon is back
        expect(
            screen
                .getByRole('button', { name: /Open main menu/i })
                .querySelector('svg path[d="M4 6h16M4 12h16M4 18h16"]'),
        ).toBeInTheDocument();
        // Check if mobile-specific element is hidden again
        expect(
            screen.queryByRole('button', { name: /Switch to Dark Mode 🌙/i }),
        ).not.toBeInTheDocument();
    });

    test('renders mobile navigation links when menu is open', () => {
        render(<Navbar darkMode={false} toggleDarkMode={mockToggleDarkMode} />);
        const menuButton = screen.getByRole('button', { name: /Open main menu/i });
        fireEvent.click(menuButton); // Open menu

        // Check for links within the mobile menu section
        // Note: These might be duplicates of desktop links but rendered differently. Test their presence.
        expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument(); // Might match desktop too, check context if needed
        // To be more specific, we might need to query within the mobile menu div if it had a test-id
        const mobileLinks = screen.getAllByRole('link');
        // Check if expected links are present among all rendered links
        expect(mobileLinks.some((link) => link.textContent === 'Portfolio')).toBe(true);
        expect(mobileLinks.some((link) => link.textContent === 'Market Analysis')).toBe(true);
        expect(mobileLinks.some((link) => link.textContent === 'AI Recommendations')).toBe(true);
        expect(mobileLinks.some((link) => link.textContent === 'Blockchain Explorer')).toBe(true);
        expect(mobileLinks.some((link) => link.textContent === 'Dashboard')).toBe(true);
        expect(mobileLinks.some((link) => link.textContent === 'Login')).toBe(true);
    });
});
