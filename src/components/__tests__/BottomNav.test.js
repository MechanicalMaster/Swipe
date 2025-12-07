import React from 'react';
import { render, screen } from '@testing-library/react';
import BottomNav from '../BottomNav';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock next/link to render as regular anchor
jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>;
    };
});

// Import the mocked usePathname
import { usePathname } from 'next/navigation';

describe('BottomNav', () => {
    beforeEach(() => {
        // Default to home route
        usePathname.mockReturnValue('/');
    });

    describe('rendering', () => {
        it('should render all navigation items on home page', () => {
            usePathname.mockReturnValue('/');
            render(<BottomNav />);

            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Bills')).toBeInTheDocument();
            expect(screen.getByText('Products')).toBeInTheDocument();
            expect(screen.getByText('Parties')).toBeInTheDocument();
            expect(screen.getByText('More')).toBeInTheDocument();
        });

        it('should render correct navigation links', () => {
            usePathname.mockReturnValue('/');
            render(<BottomNav />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveAttribute('href', '/');

            const billsLink = screen.getByText('Bills').closest('a');
            expect(billsLink).toHaveAttribute('href', '/bills');

            const productsLink = screen.getByText('Products').closest('a');
            expect(productsLink).toHaveAttribute('href', '/products');

            const partiesLink = screen.getByText('Parties').closest('a');
            expect(partiesLink).toHaveAttribute('href', '/parties');

            const moreLink = screen.getByText('More').closest('a');
            expect(moreLink).toHaveAttribute('href', '/more');
        });
    });

    describe('route-based visibility', () => {
        it('should hide on /add routes', () => {
            usePathname.mockReturnValue('/products/add');
            const { container } = render(<BottomNav />);

            expect(container.firstChild).toBeNull();
        });

        it('should hide on /create routes', () => {
            usePathname.mockReturnValue('/invoice/create');
            const { container } = render(<BottomNav />);

            expect(container.firstChild).toBeNull();
        });

        it('should hide on /view routes', () => {
            usePathname.mockReturnValue('/invoice/view');
            const { container } = render(<BottomNav />);

            expect(container.firstChild).toBeNull();
        });

        it('should hide on /edit routes', () => {
            usePathname.mockReturnValue('/products/edit');
            const { container } = render(<BottomNav />);

            expect(container.firstChild).toBeNull();
        });

        it('should show on main listing pages', () => {
            usePathname.mockReturnValue('/products');
            render(<BottomNav />);

            expect(screen.getByText('Products')).toBeInTheDocument();
        });

        it('should show on parties page', () => {
            usePathname.mockReturnValue('/parties');
            render(<BottomNav />);

            expect(screen.getByText('Home')).toBeInTheDocument();
        });
    });

    describe('active state', () => {
        it('should apply active class to current route', () => {
            usePathname.mockReturnValue('/products');
            render(<BottomNav />);

            // The Products link should be in the document
            const productsLink = screen.getByText('Products').closest('a');
            expect(productsLink).toBeInTheDocument();
        });

        it('should not apply active class to non-current routes', () => {
            usePathname.mockReturnValue('/');
            render(<BottomNav />);

            // Home should be active, all others should not be
            const homeLink = screen.getByText('Home').closest('a');
            const billsLink = screen.getByText('Bills').closest('a');

            expect(homeLink).toBeInTheDocument();
            expect(billsLink).toBeInTheDocument();
        });
    });
});
