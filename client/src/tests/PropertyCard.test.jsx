import { render, screen } from '@testing-library/react';
import Card from '../components/card/Card';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className }) => (
    <a href={to} className={className}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

vi.mock('../lib/apiRequest', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('../components/PropertyImage/PropertyImage', () => ({
  default: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

vi.mock('../context/AuthContext', async () => {
  const { createContext } = await import('react');
  return { AuthContext: createContext({ currentUser: null }) };
});

vi.mock('../context/SocketContext', async () => {
  const { createContext } = await import('react');
  return { SocketContext: createContext({ socket: null }) };
});

vi.mock('../context/ChatContext', async () => {
  const { createContext } = await import('react');
  return { ChatContext: createContext({ setChat: vi.fn(), unreadChats: [] }) };
});

vi.mock('../context/FavoritesContext', () => ({
  useFavorites: () => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
    isInCompare: vi.fn(() => false),
    toggleCompare: vi.fn(),
    shareProperty: vi.fn(),
  }),
}));

vi.mock('../context/CurrencyContext', () => ({
  useCurrency: () => ({
    formatPrice: (price) => `$${price}`,
  }),
}));

const mockItem = {
  id: 'prop-123',
  title: 'Modern City Apartment',
  price: 450000,
  address: '42 Elm Street, Chicago',
  bedroom: 3,
  bathroom: 2,
  images: ['https://example.com/property.jpg'],
  userId: 'other-user-999',
  user: { username: 'seller', avatar: null },
  isNew: false,
  status: 'available',
};

describe('PropertyCard', () => {
  it('renders the property title', () => {
    render(<Card item={mockItem} />);
    expect(screen.getByText('Modern City Apartment')).toBeInTheDocument();
  });

  it('renders the formatted price', () => {
    render(<Card item={mockItem} />);
    expect(screen.getByText('$450000')).toBeInTheDocument();
  });

  it('renders the property address', () => {
    render(<Card item={mockItem} />);
    expect(screen.getByText('42 Elm Street, Chicago')).toBeInTheDocument();
  });

  it('renders the bedroom count', () => {
    render(<Card item={mockItem} />);
    expect(screen.getByText(/3.*search\.bedrooms/)).toBeInTheDocument();
  });

  it('renders the bathroom count', () => {
    render(<Card item={mockItem} />);
    expect(screen.getByText(/2.*search\.bathrooms/)).toBeInTheDocument();
  });

  it('clicking the card title link navigates to the correct property URL', () => {
    render(<Card item={mockItem} />);
    const links = screen.getAllByRole('link');
    const propertyLinks = links.filter(
      (l) => l.getAttribute('href') === '/property/prop-123'
    );
    expect(propertyLinks.length).toBeGreaterThan(0);
  });

  it('renders the favorite button', () => {
    render(<Card item={mockItem} />);
    expect(screen.getByAltText('favorite')).toBeInTheDocument();
  });
});
