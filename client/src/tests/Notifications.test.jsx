import { render, screen } from '@testing-library/react';
import NotificationsPage from '../routes/notificationsPage/NotificationsPage';

vi.mock('../context/RecommendationsContext', () => ({
  useRecommendations: () => ({
    notifications: [],
    getUnreadNotifications: () => [],
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
    clearNotifications: vi.fn(),
    priceAlerts: [],
    removePriceAlert: vi.fn(),
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../lib/notificationService', () => ({
  default: {
    showNotification: vi.fn(),
    isNotificationEnabled: vi.fn(() => false),
    showPriceDropAlert: vi.fn(),
    showNewListingAlert: vi.fn(),
  },
}));

describe('NotificationsPage', () => {
  it('renders 4 stat cards with correct labels', () => {
    render(<NotificationsPage />);
    expect(screen.getByText('Unread')).toBeInTheDocument();
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('Price Drops')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders All, Unread, Alerts, and Messages filter tabs', () => {
    render(<NotificationsPage />);
    expect(screen.getByRole('button', { name: /^All/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Unread/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Alerts/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Messages/ })).toBeInTheDocument();
  });

  it('shows empty state with bell icon when notifications array is empty', () => {
    render(<NotificationsPage />);
    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });

  it('renders the Real-time Updates checkbox', () => {
    render(<NotificationsPage />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText(/Real-time Updates/)).toBeInTheDocument();
  });
});
