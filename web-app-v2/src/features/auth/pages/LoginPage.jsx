import React from 'react';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { LoginCard } from '../components/LoginCard';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

export const LoginPage = () => {
  const { login } = useGoogleLogin();

  return (
    <AuthLayout>
      <LoginCard onGoogleLogin={login} />
    </AuthLayout>
  );
};
