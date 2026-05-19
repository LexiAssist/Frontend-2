import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SettingsPage from '../page';
import * as authHooks from '@/hooks/useAuth';
import * as settingsHook from '@/hooks/useSettings';
import { useAuthStore } from '@/store/authStore';
import { setupQueryTest } from '@/__tests__/test-utils';

// Mock the hooks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/useSettings');
vi.mock('@/store/authStore');

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockSessions = [
  {
    id: 'session-1',
    user_id: 'user-123',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    device_name: 'Chrome on Windows',
    device_type: 'desktop',
    os: 'Windows 10',
    browser: 'Chrome',
    location: 'New York, US',
    created_at: '2024-01-15T10:00:00Z',
    last_active_at: '2024-01-15T14:30:00Z',
    is_current: true,
  },
  {
    id: 'session-2',
    user_id: 'user-123',
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
    device_name: 'Safari on iPhone',
    device_type: 'mobile',
    os: 'iOS 17',
    browser: 'Safari',
    location: 'San Francisco, US',
    created_at: '2024-01-14T08:00:00Z',
    last_active_at: '2024-01-15T12:00:00Z',
    is_current: false,
  },
  {
    id: 'session-3',
    user_id: 'user-123',
    ip_address: '192.168.1.3',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/121.0',
    device_type: 'desktop',
    browser: 'Firefox',
    location: 'London, UK',
    created_at: '2024-01-13T15:00:00Z',
    last_active_at: '2024-01-14T18:00:00Z',
    is_current: false,
  },
];

describe('Session Management', () => {
  let queryClient: any;
  let QueryWrapper: any;
  let cleanup: () => Promise<void>;

  beforeEach(() => {
    const setup = setupQueryTest();
    queryClient = setup.queryClient;
    QueryWrapper = setup.wrapper;
    cleanup = setup.cleanup;
    // Mock auth store
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        email_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      tokenExpiresAt: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      refreshAccessToken: vi.fn(),
      isTokenExpired: vi.fn(),
    } as any);

    // Mock settings hook
    vi.mocked(settingsHook.useSettings).mockReturnValue({
      saveProfile: vi.fn(),
      saveNotifications: vi.fn(),
      savePrivacy: vi.fn(),
      changePassword: vi.fn(),
      deleteAccount: vi.fn(),
      profileState: { isLoading: false, error: null, success: false },
      notificationsState: { isLoading: false, error: null, success: false },
      privacyState: { isLoading: false, error: null, success: false },
      passwordState: { isLoading: false, error: null, success: false },
      deleteState: { isLoading: false, error: null, success: false },
      resetFormState: vi.fn(),
      notificationSettings: null,
      privacySettings: null,
      reminders: [],
      createReminder: vi.fn(),
      updateReminder: vi.fn(),
      deleteReminder: vi.fn(),
      refreshReminders: vi.fn(),
      isLoadingNotifications: false,
      isLoadingReminders: false,
      formStates: {
        profile: { isLoading: false, error: null, success: false },
        notifications: { isLoading: false, error: null, success: false },
        privacy: { isLoading: false, error: null, success: false },
        password: { isLoading: false, error: null, success: false },
        delete: { isLoading: false, error: null, success: false },
      },
      isMockModeEnabled: false,
      toggleMockMode: vi.fn(),
      isMockLoading: false,
    });
  });

  afterEach(async () => {
    await cleanup();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryWrapper>
        {component}
      </QueryWrapper>
    );
  };

  describe('Session List Display', () => {

  it('should display loading state while fetching sessions', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab to show session management
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
      // Should show loading skeletons
      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display error state when session fetch fails', async () => {
      const mockRefetch = vi.fn();
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load sessions'),
        refetch: mockRefetch,
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText('Failed to load sessions. Please try again.')).toBeInTheDocument();
      });

      // Should have retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      // Click retry
      await userEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should display current session with "This device" indicator', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText('This device')).toBeInTheDocument();
      });

      // Should display current session details
      expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
      expect(screen.getByText(/192\.168\.1\.1/)).toBeInTheDocument();
      expect(screen.getByText(/New York, US/)).toBeInTheDocument();
    });

    it('should display all session information (device, browser, IP, location, last active)', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        // Current session
        expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
        expect(screen.getByText(/192\.168\.1\.1.*New York, US/)).toBeInTheDocument();

        // Other sessions
        expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
        expect(screen.getByText(/192\.168\.1\.2.*San Francisco, US/)).toBeInTheDocument();
        
        // Session without device_name should show browser + device type
        expect(screen.getByText('Firefox on Desktop')).toBeInTheDocument();
        expect(screen.getByText(/192\.168\.1\.3.*London, UK/)).toBeInTheDocument();
      });
    });

    it('should display "Other Devices" section with non-current sessions', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText('Other Devices')).toBeInTheDocument();
      });

      // Should show 2 other sessions
      const otherDevicesSection = screen.getByText('Other Devices').parentElement!;
      const sessionCards = within(otherDevicesSection).getAllByText(/Last active/);
      expect(sessionCards).toHaveLength(2);
    });

    it('should show message when no other sessions exist', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: [mockSessions[0]], // Only current session
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText('No other active sessions found.')).toBeInTheDocument();
      });
    });
  });

  describe('Session Revocation', () => {
    it('should revoke a specific session when Revoke button is clicked', async () => {
      const mockRevoke = vi.fn();
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: mockRevoke,
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByText('Other Devices')).toBeInTheDocument();
      });

      // Find and click the first Revoke button
      const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
      await userEvent.click(revokeButtons[0]);

      expect(mockRevoke).toHaveBeenCalledWith('session-2');
    });

    it('should disable Revoke button while revocation is in progress', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: true, // Revocation in progress
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        const revokeButtons = screen.getAllByRole('button', { name: /revoking/i });
        expect(revokeButtons[0]).toBeDisabled();
      });
    });
  });

  describe('Logout All Devices', () => {
    it('should show "Logout All Devices" button when other sessions exist', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout all devices/i })).toBeInTheDocument();
      });
    });

    it('should not show "Logout All Devices" button when only current session exists', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: [mockSessions[0]], // Only current session
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /logout all devices/i })).not.toBeInTheDocument();
      });
    });

    it('should show confirmation modal when "Logout All Devices" is clicked', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout all devices/i })).toBeInTheDocument();
      });

      // Click Logout All Devices
      const logoutAllButton = screen.getByRole('button', { name: /logout all devices/i });
      await userEvent.click(logoutAllButton);

      // Should show confirmation modal
      await waitFor(() => {
        expect(screen.getByText('Logout from all devices?')).toBeInTheDocument();
        expect(screen.getByText(/This will end all your active sessions/)).toBeInTheDocument();
      });
    });

    it('should close confirmation modal when Cancel is clicked', async () => {
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout all devices/i })).toBeInTheDocument();
      });

      // Click Logout All Devices
      const logoutAllButton = screen.getByRole('button', { name: /logout all devices/i });
      await userEvent.click(logoutAllButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByText('Logout from all devices?')).toBeInTheDocument();
      });

      // Click Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByText('Logout from all devices?')).not.toBeInTheDocument();
      });
    });

    it('should call logoutAll mutation when confirmed', async () => {
      const mockLogoutAll = vi.fn();
      vi.mocked(authHooks.useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(authHooks.useRevokeSession).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      vi.mocked(authHooks.useLogoutAll).mockReturnValue({
        mutate: mockLogoutAll,
        isPending: false,
      } as any);

      renderWithProviders(<SettingsPage />);

      // Click on Account tab
      const accountTab = screen.getByRole('button', { name: /account/i });
      await userEvent.click(accountTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout all devices/i })).toBeInTheDocument();
      });

      // Click Logout All Devices
      const logoutAllButton = screen.getByRole('button', { name: /logout all devices/i });
      await userEvent.click(logoutAllButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByText('Logout from all devices?')).toBeInTheDocument();
      });

      // Click Logout All in modal
      const confirmButtons = screen.getAllByRole('button', { name: /logout all/i });
      const confirmButton = confirmButtons.find(btn => 
        btn.className.includes('bg-red-600')
      );
      await userEvent.click(confirmButton!);

      expect(mockLogoutAll).toHaveBeenCalled();
    });
  });
});
