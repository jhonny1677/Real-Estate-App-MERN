import { render, screen, fireEvent } from '@testing-library/react';
import FavoritesPage from '../routes/favoritesPage/favoritesPage';

const mockToggleFavorite = vi.hoisted(() => vi.fn());
let mockFavorites = [];

vi.mock('../context/FavoritesContext', () => ({
  useFavorites: () => ({
    favorites: mockFavorites,
    toggleFavorite: mockToggleFavorite,
  }),
}));

vi.mock('../context/AuthContext', async () => {
  const { createContext } = await import('react');
  return {
    AuthContext: createContext({ currentUser: { id: 'user1', username: 'testuser' } }),
  };
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Stub Card to avoid its deep dependency tree
vi.mock('../components/card/Card', () => ({
  default: ({ item }) => <div data-testid="property-card">{item.title}</div>,
}));

const mockProperty = {
  id: 'prop-1',
  title: 'Cozy Studio',
  price: 200000,
  address: '1 Test Ave',
  bedroom: 1,
  bathroom: 1,
  images: [],
  userId: 'other-user',
  user: { username: 'owner', avatar: null },
};

beforeEach(() => {
  mockFavorites = [];
  mockToggleFavorite.mockClear();
});

describe('FavoritesPage — empty state', () => {
  it('shows empty state heading when no favorites exist', () => {
    render(<FavoritesPage />);
    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
  });

  it('shows browse prompt in empty state', () => {
    render(<FavoritesPage />);
    expect(screen.getByText(/Start browsing properties/)).toBeInTheDocument();
  });
});

describe('FavoritesPage — with one favorite', () => {
  beforeEach(() => {
    mockFavorites = [mockProperty];
  });

  it('renders a property card for the favorite item', () => {
    render(<FavoritesPage />);
    expect(screen.getByTestId('property-card')).toBeInTheDocument();
    expect(screen.getByText('Cozy Studio')).toBeInTheDocument();
  });

  it('shows a remove button for the favorited card', () => {
    render(<FavoritesPage />);
    expect(screen.getByText(/Remove/)).toBeInTheDocument();
  });

  it('clicking remove calls toggleFavorite with the correct property', () => {
    render(<FavoritesPage />);
    fireEvent.click(screen.getByText(/💔 Remove/));
    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
    expect(mockToggleFavorite).toHaveBeenCalledWith(mockProperty);
  });
});
