/**
 * Integration test for user profile management
 * Tests Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSettings } from '@/hooks/useSettings';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';
import type { User } from '@/types';
import { setupQueryTest } from '@/__tests__/test-utils';

// Mock the API
vi.mock('@/services/api', () => ({
  authApi: {
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
  notificationApi: {
    getPreferences: vi.fn(),
    updatePreferences: vi.fn(),
    getReminders: vi.fn(),
  },
}));

// Mock the auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        school: 'Test University',
        department: 'Computer Science',
        academic_level: 'undergraduate',
      },
      updateUser: vi.fn(),
    })),
  },
}));

// Mock useMockMode
vi.mock('@/hooks/useMockMode', () => ({
  useMockMode: () => ({
    isMockModeEnabled: false,
    toggleMockMode: vi.fn(),
    setMockMode: vi.fn(),
    isLoading: false,
  }),
}));

describe('Profile Management', () => {
  let wrapper: any;
  let cleanup: () => Promise<void>;

  beforeEach(() => {
    const setup = setupQueryTest();
    wrapper = setup.wrapper;
    cleanup = setup.cleanup;
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should update profile with partial data (Requirement 10.3)', async () => {
    const mockUpdatedUser: User = {
      id: '123',
      email: 'test@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      school: 'Test University',
      department: 'Computer Science',
      academic_level: 'undergraduate',
      role: 'student',
    };

    vi.mocked(authApi.updateProfile).mockResolvedValue(mockUpdatedUser);

    const { result } = renderHook(() => useSettings());

    const profileData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test@example.com',
      school: 'Test University',
      department: 'Computer Science',
      academicLevel: 'undergraduate',
    };

    const success = await result.current.saveProfile(profileData);

    expect(success).toBe(true);
    expect(authApi.updateProfile).toHaveBeenCalledWith({
      first_name: 'Jane',
      last_name: 'Smith',
      school: 'Test University',
      department: 'Computer Science',
      academic_level: 'undergraduate',
    });
  });

  it('should update auth store after successful profile update (Requirement 10.4)', async () => {
    const mockUpdatedUser: User = {
      id: '123',
      email: 'test@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      school: 'New University',
      department: 'Engineering',
      academic_level: 'graduate',
      role: 'student',
    };

    vi.mocked(authApi.updateProfile).mockResolvedValue(mockUpdatedUser);
    const mockUpdateUser = vi.fn();
    vi.mocked(useAuthStore.getState).mockReturnValue({
      user: mockUpdatedUser,
      updateUser: mockUpdateUser,
    } as any);

    const { result } = renderHook(() => useSettings());

    const profileData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test@example.com',
      school: 'New University',
      department: 'Engineering',
      academicLevel: 'graduate',
    };

    await result.current.saveProfile(profileData);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(mockUpdatedUser);
    });
  });

  it('should handle profile update errors (Requirement 10.5)', async () => {
    const errorMessage = 'Invalid profile data';
    vi.mocked(authApi.updateProfile).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useSettings());

    const profileData = {
      firstName: '',
      lastName: '',
      email: 'test@example.com',
    };

    const success = await result.current.saveProfile(profileData);

    expect(success).toBe(false);
    await waitFor(() => {
      expect(result.current.profileState.error).toBe(errorMessage);
    });
  });

  it('should change password successfully (Requirement 10.6)', async () => {
    vi.mocked(authApi.changePassword).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSettings());

    const success = await result.current.changePassword('oldPassword123', 'newPassword456');

    expect(success).toBe(true);
    expect(authApi.changePassword).toHaveBeenCalledWith('oldPassword123', 'newPassword456');
    await waitFor(() => {
      expect(result.current.passwordState.success).toBe(true);
    });
  });

  it('should handle change password errors', async () => {
    const errorMessage = 'Current password is incorrect';
    vi.mocked(authApi.changePassword).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useSettings());

    const success = await result.current.changePassword('wrongPassword', 'newPassword456');

    expect(success).toBe(false);
    await waitFor(() => {
      expect(result.current.passwordState.error).toBe(errorMessage);
    });
  });
});
