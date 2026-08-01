import { authService } from '../services/authService';

export const useGoogleLogin = () => {
  const login = () => {
    authService.loginWithGoogle();
  };

  return { login };
};
