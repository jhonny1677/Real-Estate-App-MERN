import { render, screen, waitFor } from '@testing-library/react';
import NearbyPlaces from '../components/nearbyPlaces/NearbyPlaces';

// Leaflet creates icons and a canvas renderer at module load time.
// Mock the whole library so those calls are no-ops in jsdom.
vi.mock('leaflet', () => ({
  default: {
    divIcon: () => ({}),
    canvas: () => ({}),
    latLngBounds: () => ({}),
    icon: () => ({}),
  },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="nearby-map">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }) => <div data-testid="map-marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  Polyline: () => null,
  useMap: () => ({
    fitBounds: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
  }),
}));

// Realistic Overpass + OSRM response data
const overpassElements = [
  { id: 1, lat: 40.714, lon: -74.006, tags: { amenity: 'school',     name: 'Lincoln School' } },
  { id: 2, lat: 40.712, lon: -74.009, tags: { amenity: 'hospital',   name: 'City Hospital' } },
  { id: 3, lat: 40.716, lon: -74.003, tags: { shop: 'supermarket',   name: 'FreshMart' } },
  { id: 4, lat: 40.718, lon: -74.007, tags: { amenity: 'restaurant', name: 'The Bistro' } },
  { id: 5, lat: 40.710, lon: -74.008, tags: { highway: 'bus_stop',   name: 'Main St Bus Stop' } },
  { id: 6, lat: 40.715, lon: -74.004, tags: { amenity: 'pharmacy',   name: 'QuickCare Pharmacy' } },
];

const osrmResponse = { routes: [{ distance: 500, duration: 375 }] };

function makeSuccessFetch() {
  return vi.fn((url) => {
    if (url.includes('overpass-api.de')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ elements: overpassElements }),
      });
    }
    // OSRM walking-distance request
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(osrmResponse),
    });
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NearbyPlaces', () => {
  it('shows loading spinner on mount before the API responds', () => {
    // fetch never resolves → component stays in loading state
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<NearbyPlaces latitude="40.7128" longitude="-74.0060" />);

    expect(screen.getByText(/Finding nearby places/i)).toBeInTheDocument();
    expect(document.querySelector('.nearby-spinner')).toBeInTheDocument();
  });

  it('renders category headings for all 6 types after data loads', async () => {
    vi.stubGlobal('fetch', makeSuccessFetch());
    render(<NearbyPlaces latitude="40.7128" longitude="-74.0060" />);

    // Category labels appear in both the map legend and the <h4> group headings.
    // Use getAllByText and assert at least one match per label.
    await waitFor(() => {
      expect(screen.getAllByText(/Schools/).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/Healthcare/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Supermarkets/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Restaurants/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bus Stops/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pharmacies/).length).toBeGreaterThan(0);

    // Confirm the <h4> group headings are present (not just legend spans)
    expect(screen.getByRole('heading', { name: /Schools/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Healthcare/ })).toBeInTheDocument();
  });

  it('renders each place card with name and distance', async () => {
    vi.stubGlobal('fetch', makeSuccessFetch());
    render(<NearbyPlaces latitude="40.7128" longitude="-74.0060" />);

    await waitFor(() => {
      expect(screen.getByText('Lincoln School')).toBeInTheDocument();
    });

    // Check a few place names across different categories
    expect(screen.getByText('City Hospital')).toBeInTheDocument();
    expect(screen.getByText('FreshMart')).toBeInTheDocument();

    // OSRM returns distance: 500m → "0.5" km shown in every card
    const distanceLabels = screen.getAllByText(/0\.5 km/);
    expect(distanceLabels.length).toBeGreaterThan(0);

    // OSRM returns duration: 375s → ceil(375/60)=7 min
    const walkLabels = screen.getAllByText(/7 min/);
    expect(walkLabels.length).toBeGreaterThan(0);
  });

  it('shows graceful empty state when Overpass returns no results', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('overpass-api.de')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ elements: [] }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(osrmResponse) });
    }));

    render(<NearbyPlaces latitude="40.7128" longitude="-74.0060" />);

    await waitFor(() => {
      expect(screen.getByText(/No nearby places found/)).toBeInTheDocument();
    });
  });
});
