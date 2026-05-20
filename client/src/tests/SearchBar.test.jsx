import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/searchBar/SearchBar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className }) => (
    <a href={to} className={className}>{children}</a>
  ),
  useLocation: () => ({ search: '' }),
}));

vi.mock('../lib/apiRequest', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) },
}));

describe('SearchBar', () => {
  it('renders Location, MinPrice, and MaxPrice inputs', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('search.location')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('search.minPrice')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('search.maxPrice')).toBeInTheDocument();
  });

  it('renders For Sale and For Rent tab buttons', () => {
    render(<SearchBar />);
    expect(screen.getByText('property.forSale')).toBeInTheDocument();
    expect(screen.getByText('property.forRent')).toBeInTheDocument();
  });

  it('clicking For Rent tab makes it active', () => {
    render(<SearchBar />);
    const saleTab = screen.getByText('property.forSale');
    const rentTab = screen.getByText('property.forRent');

    // buy is the default active tab
    expect(saleTab).toHaveClass('active');
    expect(rentTab).not.toHaveClass('active');

    fireEvent.click(rentTab);

    expect(rentTab).toHaveClass('active');
    expect(saleTab).not.toHaveClass('active');
  });

  it('search link navigates to /list with correct query params after entering location', () => {
    render(<SearchBar />);
    const cityInput = screen.getByPlaceholderText('search.location');

    fireEvent.change(cityInput, { target: { value: 'New York' } });

    const link = screen.getByRole('link');
    const href = link.getAttribute('href');

    expect(href).toContain('/list');
    expect(href).toContain('type=buy');
    expect(href).toContain('city=New%20York');
  });
});
