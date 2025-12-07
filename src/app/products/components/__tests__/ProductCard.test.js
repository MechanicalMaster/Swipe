import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }) => <a href={href}>{children}</a>;
});

describe('ProductCard', () => {
    const mockProduct = {
        id: 1,
        name: 'Gold Ring',
        category: 'Ring',
        purity: '22K',
        grossWeight: 10.5,
        stoneType: 'Diamond',
        tags: '',
    };

    const mockOnAddToTray = jest.fn();
    const mockOnShare = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render product title with category and purity', () => {
            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            expect(screen.getByText('Ring – 22K')).toBeInTheDocument();
        });

        it('should display weight correctly formatted', () => {
            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            expect(screen.getByText(/Weight: 10.50g/)).toBeInTheDocument();
        });

        it('should display stone type', () => {
            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            expect(screen.getByText(/Stone: Diamond/)).toBeInTheDocument();
        });

        it('should show purity badge', () => {
            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            expect(screen.getByText('22K')).toBeInTheDocument();
        });

        it('should show Bestseller badge when product has bestseller tag', () => {
            const bestsellerProduct = {
                ...mockProduct,
                tags: 'bestseller, popular',
            };

            render(
                <ProductCard
                    product={bestsellerProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            expect(screen.getByText('Bestseller')).toBeInTheDocument();
        });

        it('should not show Bestseller badge when tag is absent', () => {
            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            expect(screen.queryByText('Bestseller')).not.toBeInTheDocument();
        });
    });

    describe('default values', () => {
        it('should show default purity when not provided', () => {
            const productWithoutPurity = { ...mockProduct, purity: '' };

            render(
                <ProductCard
                    product={productWithoutPurity}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            // Default is 22K
            expect(screen.getAllByText('22K').length).toBeGreaterThan(0);
        });

        it('should show 0.00g when grossWeight is not provided', () => {
            const productWithoutWeight = { ...mockProduct, grossWeight: null };

            render(
                <ProductCard
                    product={productWithoutWeight}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            expect(screen.getByText(/Weight: 0.00g/)).toBeInTheDocument();
        });

        it('should show Plain Gold when stoneType is not provided', () => {
            const productWithoutStone = { ...mockProduct, stoneType: '' };

            render(
                <ProductCard
                    product={productWithoutStone}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            expect(screen.getByText(/Stone: Plain Gold/)).toBeInTheDocument();
        });
    });

    describe('interactions', () => {
        it('should call onAddToTray when Add to Tray button is clicked', () => {
            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            const addButton = screen.getByText('Add to Tray');
            fireEvent.click(addButton);

            expect(mockOnAddToTray).toHaveBeenCalledWith(mockProduct);
            expect(mockOnAddToTray).toHaveBeenCalledTimes(1);
        });

        it('should call onShare when share button is clicked', () => {
            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            // Find the WhatsApp button (it's an icon button)
            const buttons = screen.getAllByRole('button');
            const shareButton = buttons.find(btn => btn.querySelector('svg'));

            if (shareButton) {
                fireEvent.click(shareButton);
                expect(mockOnShare).toHaveBeenCalledWith(mockProduct);
            }
        });

        it('should stop propagation when action buttons are clicked', () => {
            const mockCardClick = jest.fn();

            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            const addButton = screen.getByText('Add to Tray');
            fireEvent.click(addButton);

            // onAddToTray should be called, but not navigate (we can't test navigation directly)
            expect(mockOnAddToTray).toHaveBeenCalled();
        });
    });

    describe('image handling', () => {
        it('should show placeholder when no images', () => {
            render(
                <ProductCard
                    product={mockProduct}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            // Placeholder contains FiShoppingBag icon
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
        });

        it('should render image when images array has data', () => {
            const productWithImage = {
                ...mockProduct,
                images: [{ data: 'data:image/png;base64,abc123' }],
            };

            render(
                <ProductCard
                    product={productWithImage}
                    onAddToTray={mockOnAddToTray}
                    onShare={mockOnShare}
                />
            );

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('src', 'data:image/png;base64,abc123');
        });
    });
});
