import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, sessionApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Hook to get current user
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authApi.getMe(),
    retry: false,
  });
}

// Hook for login
export function useLogin(redirectUrl?: string) {
  const router = useRouter();
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      // Update auth store with tokens
      login(data.user, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      });
      
      // Update React Query cache
      queryClient.setQueryData(authKeys.user(), data.user);
      
      toast.success('Welcome back!');
      
      // Redirect to original destination or dashboard (Requirement 3.3)
      const destination = redirectUrl || '/dashboard';
      router.push(destination);
    },
    onError: (error: ApiError) => {
      // Don't show toast here - let the component handle specific error messages
      throw error;
    },
  });
}

// Hook for registration
export function useRegister() {
  const router = useRouter();
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user, variables) => {
      
      // If email is already verified (bypass mode), auto-login
      if (user.email_verified) {
        toast.success('Account created! Logging you in...');
        // Auto-login since email is already verified
        authApi.login(variables.email, variables.password)
          .then((loginData) => {
            login(loginData.user, {
              accessToken: loginData.access_token,
              refreshToken: loginData.refresh_token,
              expiresAt: loginData.expires_at,
            });
            queryClient.setQueryData(authKeys.user(), loginData.user);
            toast.success('Welcome to LexiAssist!');
            router.push('/dashboard');
          })
          .catch(() => {
            toast.error('Auto-login failed. Please log in manually.');
            router.push('/login');
          });
      } else {
        // Normal flow - redirect to verification
        toast.success('Account created! Please check your email for verification code.');
        router.push(`/verify-email?userId=${user.id}`);
      }
    },
    onError: (error: ApiError) => {
      // Don't show toast here - let the component handle specific error messages (Requirements 7.4, 7.5)
      throw error;
    },
  });
}

// Hook for email verification
export function useVerifyEmail() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) =>
      authApi.verifyEmail(userId, code),
    onSuccess: () => {
      toast.success('Email verified! Please log in.');
      router.push('/login');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Verification failed');
    },
  });
}

// Hook for resending verification email
export function useResendVerification(userId: string) {
  return useMutation({
    mutationFn: () => authApi.resendVerification(userId),
    onSuccess: () => {
      toast.success('Verification code resent! Check your email.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to resend verification code');
    },
  });
}

// Unified auth hook for components
export function useAuth(redirectUrl?: string) {
  const loginMutation = useLogin(redirectUrl);
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
  };
}

// Hook for forgot password
export function useForgotPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success('If an account exists, a password reset link has been sent to your email.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    },
  });
}

// Hook for reset password
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Password reset successful! Please log in with your new password.');
      router.push('/login');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
    },
  });
}

// Hook for change password
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully. Please log in again with your new password.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to change password. Please check your current password.');
    },
  });
}

// Session management hooks
export const sessionKeys = {
  all: ['sessions'] as const,
  list: () => [...sessionKeys.all, 'list'] as const,
};

// Hook to get all sessions
export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: () => sessionApi.getSessions(),
    retry: false,
  });
}

// Hook to revoke a session
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionApi.revokeSession(sessionId),
    onSuccess: () => {
      toast.success('Session revoked successfully');
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    },
  });
}

// Hook to logout from all devices
export function useLogoutAll() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sessionApi.logoutAll(),
    onSuccess: () => {
      toast.success('Logged out from all devices');
      logout();
      queryClient.clear();
      router.push('/login');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to logout from all devices');
    },
  });
}

// Hook for logout
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Even if logout fails, clear local state
      queryClient.clear();
      router.push('/login');
    },
  });
}
