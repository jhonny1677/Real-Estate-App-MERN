import { render, screen, fireEvent } from '@testing-library/react';
import Filter from '../components/filter/Filter';

// vi.hoisted ensures this fn is created before the vi.mock factory runs
const mockSetSearchParams = vi.hoisted(() => vi.fn());

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

vi.mock('../lib/apiRequest', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) },
}));

afterEach(() => {
  mockSetSearchParams.mockClear();
});

describe('Filter', () => {
  it('renders all primary filter dropdowns', () => {
    render(<Filter />);
    expect(screen.getByLabelText('search.type')).toBeInTheDocument();
    expect(screen.getByLabelText('search.propertyType')).toBeInTheDocument();
    expect(screen.getByLabelText('search.bedrooms')).toBeInTheDocument();
    expect(screen.getByLabelText('search.bathrooms')).toBeInTheDocument();
  });

  it('renders minPrice and maxPrice number inputs', () => {
    render(<Filter />);
    const minPrice = screen.getByLabelText('search.minPrice');
    const maxPrice = screen.getByLabelText('search.maxPrice');
    expect(minPrice).toHaveAttribute('type', 'number');
    expect(maxPrice).toHaveAttribute('type', 'number');
  });

  it('price inputs only accept numbers (type=number attribute)', () => {
    render(<Filter />);
    const minPrice = screen.getByLabelText('search.minPrice');
    const maxPrice = screen.getByLabelText('search.maxPrice');

    fireEvent.change(minPrice, { target: { value: '200000' } });
    fireEvent.change(maxPrice, { target: { value: '500000' } });

    expect(minPrice).toHaveAttribute('type', 'number');
    expect(maxPrice).toHaveAttribute('type', 'number');
    expect(minPrice.value).toBe('200000');
    expect(maxPrice.value).toBe('500000');
  });

  it('changing property type and clicking Search updates URL params', () => {
    render(<Filter />);
    const propertySelect = screen.getByLabelText('search.propertyType');

    fireEvent.change(propertySelect, { target: { value: 'apartment' } });

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining({ property: 'apartment' })
    );
  });
});
